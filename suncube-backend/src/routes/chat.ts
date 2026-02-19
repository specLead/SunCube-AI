import { FastifyInstance } from 'fastify';

export default async function chatRoutes(fastify: FastifyInstance) {
  fastify.addHook('onRequest', fastify.authenticate);

  fastify.post('/', async (req, reply) => {
    const { message } = req.body as any;
    
    // Proxy to AI Service (Mock or Real)
    // const response = await fetch('https://api.openai.com/...', { ... });
    
    // Mock response
    return { 
      response: `AI says: I received your message "${message}". How can I help with your solar array?`,
      suggestions: ['Check generation', 'Report issue'] 
    };
  });
}
