import { estimatePrice } from "@/lib/constants";

export type FaqItem = {
  q: string;
  a: string;
};

export type FaqSection = {
  id: string;
  title: string;
  items: FaqItem[];
};

const from = {
  interior: estimatePrice("interior-basic", "small"),
  exterior: estimatePrice("exterior-basic", "small"),
  good: estimatePrice("good", "small"),
  goodLarge: estimatePrice("good", "large"),
  better: estimatePrice("better", "small"),
  best: estimatePrice("best", "small"),
  bestLarge: estimatePrice("best", "large"),
  plan: estimatePrice("maintenance", "small", "fortnightly"),
};

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "pricing",
    title: "Pricing & services",
    items: [
      {
        q: "What’s included in each package?",
        a: "Inside + outside bundles: Good (The Essentials) is a proper wash, vacuum and wipe. Better (The Full Detail) adds iron decon, ceramic spray, leather and shampoo. Best (The Full Treatment) adds clay, water-spot work, stain and odour. One-side jobs are exterior or interior on their own — Basic or Premium. Full lists live on the packages page.",
      },
      {
        q: "How much do you charge for a sedan or SUV?",
        a: `We price small / medium / large, not the badge on the boot. A Corolla is small. A CX-5 is medium. A Prado, Ranger or 7-seater is large. Inside + outside from $${from.good} small to $${from.goodLarge} large for The Essentials; Full Detail from $${from.better}; Full Treatment from $${from.best} ($${from.bestLarge} large). Exterior Basic from $${from.exterior}. Interior Basic from $${from.interior}. Prices include GST.`,
      },
      {
        q: "Do you offer add-ons (pet hair, engine bay, headlight restoration)?",
        a: "Clay bar ($50–$75) and water-spot removal ($40–$60) are on the card now — they sit on a package, we don’t book them alone. Pet hair, engine bay, ozone, headlights and machine polish / paint correction are coming soon. They’re listed that way because the kit isn’t there yet. Don’t book them expecting them tomorrow.",
      },
      {
        q: "Is there a loyalty or recurring plan?",
        a: `Two things, and they don’t stack. Regulars card: four paid Exterior Basics, the fifth Exterior Basic is free — same size car, marked against the phone you book with. Put “regulars card” in the notes. Maintenance plan: a standing weekly, fortnightly or monthly slot (from $${from.plan} fortnightly, small) so a detail doesn’t slide. It’s a lighter visit, not a discount on a Full Treatment.`,
      },
    ],
  },
  {
    id: "booking",
    title: "Booking",
    items: [
      {
        q: "How do I book an appointment?",
        a: "Online. Pick the size, a bundle or one side, then a morning or afternoon window on the live calendar. Confirmations are instant. Inquiries (out of area, fleet, something weird) go through the contact form — we aim to reply the same day, seven days a week.",
      },
      {
        q: "How far in advance should I book?",
        a: "When you know the day. The calendar shows open windows about six weeks out. Sundays and Saturday mornings go first. You don’t need a fortnight’s notice if the slot is still open.",
      },
      {
        q: "Can I reschedule or cancel?",
        a: "Yes. Free if you tell us by 6pm the day before (Brisbane time) — call, email, or the contact form. After that, or a no-show, we just release the slot. You haven’t paid yet, so there’s no cancel fee. We just won’t hold the window.",
      },
      {
        q: "Do you offer same-day service?",
        a: "If today’s morning or afternoon still has spots on the calendar, yes. That’s the whole policy. We don’t keep a secret same-day list — what’s open is what’s open.",
      },
    ],
  },
  {
    id: "logistics",
    title: "Mobile & logistics",
    items: [
      {
        q: "Do you come to my home or workplace?",
        a: "Either, as long as the car can sit on a drive with a working hose tap and room to walk around it. A basement carpark with no tap is a no. We come to you — not a shop drop-off.",
      },
      {
        q: "Do I need to provide water or power?",
        a: "A working hose tap, yes. The kit comes with us — no 240V outlet needed for a standard visit. No tap, or a blocked drive, and we reschedule. That’s on the access, not a cancel fee on you.",
      },
      {
        q: "What happens if it rains?",
        a: "Light drizzle we can often still wash. Heavy rain, hail, or lightning — we move the slot. That’s on us, not a cancellation on you. If weather hits the car after we leave, that’s weather, not a redo.",
      },
      {
        q: "What areas do you service?",
        a: "Greater Brisbane — inner, north, south, east and west. If your suburb is on the areas list you can book online. If it isn’t, ask; we sometimes stretch for a cluster of jobs.",
      },
      {
        q: "What about dogs, gates, or no hose?",
        a: "Dogs inside or held. Leave a gate code in the notes if we need one. No working tap or a blocked drive means we reschedule.",
      },
    ],
  },
  {
    id: "process",
    title: "Process & time",
    items: [
      {
        q: "How long does a detail take?",
        a: "The Essentials 1–1.5 hrs. Full Detail 2.5–3.5 hrs. Full Treatment 4–5 hrs, especially on a large SUV. Exterior or interior only is usually under two hours. Arrival moves with the day’s route — morning or afternoon window, not a minute-past-eight promise.",
      },
      {
        q: "What products do you use? Are they safe for my paint and interior?",
        a: "Pro-grade wash, protection, and interior products — safe for factory paint and typical interiors when used as directed. We don’t publish a brand list here because the kit moves. If you’ve got PPF, a fresh ceramic, a wrap, or a fussy interior, put it in the notes. Chips, swirls and stains that were already there may still show.",
      },
      {
        q: "Do I need to be present during the service?",
        a: "No. Car on the drive, keys sorted, dogs inside. You don’t have to stand there. If you need to leave, say so in the notes.",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "Cash or card when we finish. No online payment, no app, no invoice chase.",
      },
      {
        q: "Do you require a deposit?",
        a: "No. Pay on the day. That’s why a late cancel isn’t a fee — you haven’t paid yet.",
      },
      {
        q: "What’s your refund or satisfaction policy?",
        a: "There’s usually nothing to refund because you pay when we finish. If something we did is obviously unfinished or marked, say so before we leave or the same day — we’ll come back and fix our work. We don’t refund for swirl that was already in the paint, or weather after we leave. If we’ve started and you stop us, we may charge for time and product already used.",
      },
    ],
  },
  {
    id: "trust",
    title: "Trust & quality",
    items: [
      {
        q: "Are you insured?",
        a: "Yes. One operator, insured for driveway work. If you need the certificate in writing, ask.",
      },
      {
        q: "Do you offer a satisfaction guarantee?",
        a: "We fix our work. That’s the guarantee. Say so before we leave or the same day and we come back. It isn’t a blank cheque for old swirl, a car that wasn’t as described, or rain after we’ve packed up.",
      },
      {
        q: "Can I see before and after photos?",
        a: "The homepage has a before → after of the work, and typical jobs are written up so you can see how a visit usually goes. Named customer photos go up once we have permission to use them — we don’t fake reviews to fill the gap.",
      },
      {
        q: "Where does the ten percent go?",
        a: "Ten percent of what we take goes towards Palestine, Sudan and Lebanon. It comes out of the job, not as an extra on your bill. We haven’t named a specific charity on this site yet — if you need the recipient in writing, ask.",
      },
    ],
  },
];

export const FAQS: FaqItem[] = FAQ_SECTIONS.flatMap((section) => section.items);

function faqByQuestion(q: string): FaqItem {
  const item = FAQS.find((entry) => entry.q === q);
  if (!item) {
    throw new Error(`Missing FAQ: ${q}`);
  }
  return item;
}

export const HOME_FAQS: FaqItem[] = [
  faqByQuestion("Do you come to my home or workplace?"),
  faqByQuestion("How much do you charge for a sedan or SUV?"),
  faqByQuestion("How do I book an appointment?"),
  faqByQuestion("What payment methods do you accept?"),
];

export const PACKAGE_FAQS: FaqItem[] = [
  {
    q: "What’s the difference between Good, Better and Best?",
    a: "The Essentials (Good) is a proper inside-and-out clean. The Full Detail (Better) adds iron decon, ceramic spray, leather, and shampoo. The Full Treatment (Best) adds clay, water spots, stain and odour work. Times are 1–1.5 hrs, 2.5–3.5 hrs, and 4–5 hrs.",
  },
  {
    q: "Can I just book exterior or interior?",
    a: "Yes. Exterior Basic or Premium, Interior Basic or Premium — that’s one side only. The inside + outside bundle is cheaper than stacking both sides as separate jobs.",
  },
  {
    q: "What’s the maintenance plan?",
    a: "A standing slot: quick exterior wash, tyre shine, interior vacuum and wipe, windows. Weekly, fortnightly or monthly. It’s not a discount on a Full Treatment — it’s a lighter visit to keep a detail from sliding.",
  },
  {
    q: "Can I knock something out of a package for a discount?",
    a: "No. The packages are built to fit a morning or afternoon window. If we skip a step we don’t refund it — we spend that time on the rest of the car.",
  },
  {
    q: "Why do larger cars cost more?",
    a: "More glass, more wheels, more carpet. Same work, bigger object. Small / medium / large is on the size guide.",
  },
];
