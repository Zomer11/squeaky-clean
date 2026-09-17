import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  suburb: text("suburb").notNull(),
  address: text("address").notNull(),
  binTypes: text("bin_types").notNull(), // JSON array of package ids
  vehicle: text("vehicle"), // hatch|sedan|suv|ute
  frequency: text("frequency").notNull(), // one-off|fortnightly|monthly
  date: text("date").notNull(), // YYYY-MM-DD
  slot: text("slot").notNull(), // am|pm
  notes: text("notes"),
  status: text("status").notNull().default("confirmed"), // confirmed|cancelled
  createdAt: text("created_at").notNull(),
});

export const blockedDates = sqliteTable("blocked_dates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull().unique(),
  reason: text("reason"),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  suburb: text("suburb"),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});
