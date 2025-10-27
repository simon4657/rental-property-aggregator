import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Properties table for storing rental property information
 */
export const properties = pgTable("properties", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** Original property URL from the source website */
  propertyUrl: varchar("propertyUrl", { length: 512 }).notNull(),
  /** Full address of the property */
  address: text("address").notNull(),
  /** City/County (縣市) */
  city: varchar("city", { length: 64 }).notNull(),
  /** District (行政區) */
  district: varchar("district", { length: 64 }).notNull(),
  /** Floor information (e.g., "3/5" or "整棟") */
  floor: varchar("floor", { length: 64 }),
  /** Monthly rent price in TWD */
  price: integer("price").notNull(),
  /** Room configuration (e.g., "3房2廳1衛") */
  rooms: varchar("rooms", { length: 64 }),
  /** Building age in years */
  age: integer("age"),
  /** Whether the building has an elevator */
  hasElevator: boolean("hasElevator").default(false),
  /** Nearby MRT station or line information */
  nearMrt: varchar("nearMrt", { length: 256 }),
  /** Source website (e.g., "591", "信義房屋", "永慶房仲") */
  source: varchar("source", { length: 64 }),
  /** Additional notes */
  notes: text("notes"),
  /** User who created this entry */
  createdBy: integer("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

