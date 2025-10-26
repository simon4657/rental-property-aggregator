import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  properties: router({
    list: publicProcedure
      .input(
        z.object({
          city: z.string().optional(),
          district: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          search: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return await db.getProperties(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPropertyById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          propertyUrl: z.string().url(),
          address: z.string(),
          city: z.string(),
          district: z.string(),
          floor: z.string().optional(),
          price: z.number().int().positive(),
          rooms: z.string().optional(),
          age: z.number().int().optional(),
          hasElevator: z.boolean().optional(),
          nearMrt: z.string().optional(),
          source: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.createProperty({
          ...input,
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          propertyUrl: z.string().url().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          district: z.string().optional(),
          floor: z.string().optional(),
          price: z.number().int().positive().optional(),
          rooms: z.string().optional(),
          age: z.number().int().optional(),
          hasElevator: z.boolean().optional(),
          nearMrt: z.string().optional(),
          source: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateProperty(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProperty(input.id);
        return { success: true };
      }),

    getCities: publicProcedure.query(async () => {
      return await db.getCities();
    }),

    getDistricts: publicProcedure
      .input(z.object({ city: z.string() }))
      .query(async ({ input }) => {
        return await db.getDistrictsByCity(input.city);
      }),
  }),
});

export type AppRouter = typeof appRouter;

