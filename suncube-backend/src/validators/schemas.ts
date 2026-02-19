import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string(),
  role: z.enum(['customer', 'technician', 'admin']).optional(),
});

export const TicketCreateSchema = z.object({
  subject: z.string().min(5),
  body: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  inverterId: z.string().uuid().optional(),
});

export const TelemetryQuerySchema = z.object({
  inverterId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
