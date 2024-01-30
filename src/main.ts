import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Capture raw body for all requests
  app.use(express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));

  // Parse JSON bodies for other routes
  app.use(bodyParser.json());

  // Serve static files
  app.use(express.static(path.join(__dirname, '..', 'public')));

  await app.listen(3030);
}

bootstrap();
