import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
  const { paymentId } = JSON.parse(event.body);
  
  // Logic: Fetch data -> PDFKit -> S3 -> Return URL
  console.log(`Generating invoice for ${paymentId}`);

  return {
    statusCode: 200,
    body: JSON.stringify({ url: 'https://s3.amazonaws.com/suncube/invoices/123.pdf' })
  };
};
