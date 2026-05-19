import { z } from 'zod';

export const createStationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    location: z.string({ required_error: 'Location is required' }),
    isActive: z.boolean().optional(),
  }),
});

export const updateStationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    location: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string({ required_error: 'Station ID is required' }),
  }),
});
