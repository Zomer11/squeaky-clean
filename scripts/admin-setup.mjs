#!/usr/bin/env node
/**
 * Generates admin credentials for the ops desk.
 *
 *   npm run admin:setup            -> random 24-char password (shown once)
 *   npm run admin:setup -- --choose -> type your own (16+ chars)
 *
 * Prints ADMIN_PASSWORD_HASH and ADMIN_TOTP_SECRET to paste into .env.local
 * and your host's environment. Nothing is written to disk.
 */
import { randomBytes, scrypt } from "node:crypto";
import { createInterface } from "node:readline";

const N = 32768;
const r = 8;
const p = 1;
const KEYLEN = 64;
const ISSUER = "Auto Care Detailing";

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32(buf) {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    rl._writeToOutput = (s) => {
      if (!muted) rl.output.write(s);
      else if (s.includes("\n") || s.includes("\r")) rl.output.write("\n");
      else rl.output.write("*");
    };
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
    muted = true;
  });
}

function hash(password, salt) {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEYLEN, { N, r, p, maxmem: 256 * N * r }, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

let password;
let generated = false;
if (process.argv.includes("--choose")) {
  password = (await askHidden("New admin password (16+ chars): ")).trim();
  const again = (await askHidden("Type it again: ")).trim();
  if (password !== again) {
    console.error("\nPasswords don't match.");
    process.exit(1);
  }
  if (password.length < 16) {
    console.error("\nToo short — use at least 16 characters (a 4-5 word passphrase works).");
    process.exit(1);
  }
} else {
  password = randomBytes(18).toString("base64url");
  generated = true;
}

const salt = randomBytes(16);
const key = await hash(password, salt);
const passwordHash = `scrypt:${N}:${r}:${p}:${salt.toString("base64url")}:${key.toString("base64url")}`;
const totpSecret = base32(randomBytes(20));
const label = encodeURIComponent(`${ISSUER}:admin`);
const otpauth = `otpauth://totp/${label}?secret=${totpSecret}&issuer=${encodeURIComponent(ISSUER)}&algorithm=SHA1&digits=6&period=30`;

const line = "-".repeat(64);
console.log(`\n${line}`);
if (generated) {
  console.log("Your admin password (save it in a password manager NOW, it is not stored anywhere):\n");
  console.log(`  ${password}\n`);
}
console.log("1) Add to your authenticator app (Google Authenticator, 1Password, Authy...):");
console.log("   Choose 'enter a setup key' and type:\n");
console.log(`   ${totpSecret.match(/.{1,4}/g).join(" ")}\n`);
console.log("   Or paste this link into an app that accepts otpauth URIs:");
console.log(`   ${otpauth}\n`);
console.log("2) Put these in .env.local AND your host's environment variables");
console.log("   (remove any old ADMIN_PASSWORD / ADMIN_SECRET lines):\n");
console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
console.log(`ADMIN_TOTP_SECRET=${totpSecret}`);
console.log(`\n3) Restart the server. Changing either value signs out every session.`);
console.log(line);
