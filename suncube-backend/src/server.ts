import buildApp from './app';
import { config } from './config';

const app = buildApp();

app.listen({ port: config.port, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    (process as any).exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});
