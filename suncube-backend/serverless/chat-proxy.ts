import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  const { message } = JSON.parse(event.body);
  
  // Proxy to AI provider
  // const aiResponse = await openai.createCompletion(...)

  return {
    statusCode: 200,
    body: JSON.stringify({ 
        role: 'assistant', 
        content: `Serverless AI says: ${message}` 
    })
  };
};
