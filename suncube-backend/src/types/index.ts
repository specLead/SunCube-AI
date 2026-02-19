import { FastifyRequest } from 'fastify';

export interface UserPayload {
  id: string;
  role: 'customer' | 'technician' | 'admin';
  email: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: UserPayload;
  }
}