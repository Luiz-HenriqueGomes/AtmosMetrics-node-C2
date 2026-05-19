import { z } from 'zod';

export const createReadingSchema = z.object({
  body: z.object({
    temperature: z.number({ required_error: 'Temperature is required' }),
    humidity: z.number({ required_error: 'Humidity is required' }),
    airQuality: z.number().optional(),
    stationId: z.string({ required_error: 'Station ID is required' }),
  }),
});
