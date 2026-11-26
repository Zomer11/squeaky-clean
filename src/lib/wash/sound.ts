/**
 * Pressure-washer hiss, synthesised with Web Audio. No audio files.
 * Filtered white noise + a low pump rumble, gain follows spray intensity.
 */
export class WashSound {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private pumpGain: GainNode | null = null;

  get ready() {
    return this.ctx !== null;
  }

  /** Must be called from a user gesture. */
  start() {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2600;
    filter.Q.value = 0.6;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    // pump: low sawtooth through a lowpass, pulses a little
    const pump = ctx.createOscillator();
    pump.type = "sawtooth";
    pump.frequency.value = 48;
    const pumpLp = ctx.createBiquadFilter();
    pumpLp.type = "lowpass";
    pumpLp.frequency.value = 140;
    const pumpGain = ctx.createGain();
    pumpGain.gain.value = 0;

    noise.connect(filter).connect(gain).connect(ctx.destination);
    pump.connect(pumpLp).connect(pumpGain).connect(ctx.destination);
    noise.start();
    pump.start();

    this.ctx = ctx;
    this.gain = gain;
    this.filter = filter;
    this.pumpGain = pumpGain;
  }

  /** intensity 0..1, foam = softer, lower hiss */
  set(intensity: number, foam: boolean) {
    if (!this.ctx || !this.gain || !this.filter || !this.pumpGain) return;
    const t = this.ctx.currentTime;
    this.gain.gain.setTargetAtTime(intensity * (foam ? 0.16 : 0.26), t, 0.06);
    this.filter.frequency.setTargetAtTime(foam ? 1400 : 2800, t, 0.1);
    this.pumpGain.gain.setTargetAtTime(intensity * 0.05, t, 0.1);
  }

  stop() {
    this.set(0, false);
    void this.ctx?.suspend();
  }

  dispose() {
    void this.ctx?.close();
    this.ctx = null;
  }
}
