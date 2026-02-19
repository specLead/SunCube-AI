import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { LoginSchema, RegisterSchema } from '../validators/schemas';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

type RegisterInput = z.infer<typeof RegisterSchema>;
type LoginInput = z.infer<typeof LoginSchema>;

export default async function authRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post('/register', { schema: { body: RegisterSchema } }, async (req, reply) => {
    const { email, password, name, role } = req.body as RegisterInput;
    
    const hash = await bcrypt.hash(password, 10);
    
    try {
      const [user] = await fastify.db('users')
        .insert({ email, password_hash: hash, name, role: role || 'customer' })
        .returning(['id', 'email', 'role']);
        
      return user;
    } catch (err: any) {
      if (err.code === '23505') return reply.status(409).send({ error: 'Email already exists' });
      throw err;
    }
  });

  app.post('/login', { schema: { body: LoginSchema } }, async (req, reply) => {
    const { email, password } = req.body as LoginInput;
    
    const user = await fastify.db('users').where({ email }).first();
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Cast fastify to any to access jwt if type augmentation fails
    const token = (fastify as any).jwt.sign({ id: user.id, role: user.role, email: user.email });
    return { token, user: { id: user.id, email: user.email, role: user.role, name: user.name } };
  });

  app.post('/refresh', async (req, reply) => {
    return reply.status(501).send({ message: 'Not implemented' });
  });
}
