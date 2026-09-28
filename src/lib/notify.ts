import "server-only";

import { BUSINESS, packageLabel, vehicleLabel } from "@/lib/constants";
import { formatDateLabel, formatSlotLabel } from "@/lib/booking";
import { maskMobile } from "@/lib/phone";
import type { Frequency, PackageId, Slot, VehicleId } from "@/lib/constants";

export type BookingNotice = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  suburb: string;
  address: string;
  vehicle: VehicleId;
  packageId: PackageId;
  frequency: Frequency;
  date: string;
  slot: Slot;
  notes?: string;
  price: number;
};

export type InquiryNotice = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  suburb?: string;
  message: string;
};

export type NotifyResult = {
  sms: boolean;
  email: boolean;
};

async function sendDeskMail(
  subject: string,
  text: string,
  logLabel: string,
): Promise<boolean> {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  const to = process.env.NOTIFY_EMAIL?.trim() || user;
  if (!user || !pass || !to) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[notify] desk email skipped (no Gmail). Would send ${logLabel} to ${to || "unset"}`,
      );
    }
    return false;
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  await transporter.sendMail({
    from: `"${BUSINESS.name}" <${user}>`,
    to,
    subject,
    text,
  });
  return true;
}

function ownerEmailBody(job: BookingNotice): { subject: string; text: string } {
  const when = `${formatDateLabel(job.date)} · ${formatSlotLabel(job.slot)}`;
  const freq = job.frequency === "one-off" ? "One visit" : job.frequency;
  return {
    subject: `Booking #${job.id} · ${job.suburb} · ${when}`,
    text: [
      `Booking #${job.id}`,
      when,
      `${packageLabel(job.packageId)} · ${vehicleLabel(job.vehicle)} · ${freq}`,
      `Estimate: $${job.price} this visit · pay on the day`,
      "",
      job.name,
      job.phone,
      job.email || "No customer email",
      `${job.address}, ${job.suburb}`,
      job.notes ? `Notes: ${job.notes}` : "No notes",
    ].join("\n"),
  };
}

async function sendOwnerEmail(job: BookingNotice): Promise<boolean> {
  const { subject, text } = ownerEmailBody(job);
  return sendDeskMail(subject, text, `booking #${job.id}`);
}

async function sendCustomerSms(job: BookingNotice): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const auth = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM?.trim();
  const when = `${formatDateLabel(job.date)}, ${formatSlotLabel(job.slot).toLowerCase()}`;
  const body = `Squeaky Solutions: you're booked ${when}. #${job.id}. Pay on the day. Cancel by 6pm the day before.`;

  if (!sid || !auth || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[notify] SMS skipped (no Twilio). Would text ${maskMobile(job.phone)}: ${body}`,
      );
    }
    return false;
  }

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${auth}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: job.phone,
        Body: body,
      }),
    },
  );

  if (!res.ok) {
    console.error(`[notify] SMS failed ${res.status} for #${job.id}`);
    return false;
  }
  return true;
}

export async function notifyBooking(job: BookingNotice): Promise<NotifyResult> {
  const [sms, email] = await Promise.all([
    sendCustomerSms(job).catch((err) => {
      console.error("[notify] SMS threw", err);
      return false;
    }),
    sendOwnerEmail(job).catch((err) => {
      console.error("[notify] email threw", err);
      return false;
    }),
  ]);
  return { sms, email };
}

export async function notifyInquiry(inquiry: InquiryNotice): Promise<boolean> {
  const subject = `Inquiry #${inquiry.id} · ${inquiry.suburb || "no suburb"}`;
  const text = [
    `Inquiry #${inquiry.id}`,
    "",
    inquiry.name,
    inquiry.phone,
    inquiry.email || "No customer email",
    inquiry.suburb || "No suburb",
    "",
    inquiry.message,
  ].join("\n");

  try {
    return await sendDeskMail(subject, text, `inquiry #${inquiry.id}`);
  } catch (err) {
    console.error("[notify] inquiry email threw", err);
    return false;
  }
}
