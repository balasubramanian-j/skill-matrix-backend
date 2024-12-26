import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('API');

  // Set global prefix (exclude docs routes from prefix)
  app.setGlobalPrefix('api', {
    exclude: ['/docs', '/docs/pdf', '/docs/swagger.json']
  });

  // Enable CORS with Ngrok domain
  app.enableCors({
    origin: ['http://localhost:3000', 'https://8123-27-5-104-143.ngrok-free.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Add request logging middleware
  morgan.token('body', (req: any) => JSON.stringify(req.body));
  morgan.token('user', (req: any) => req.user?.employeeCode || 'anonymous');
  
  app.use(morgan((tokens, req, res) => {
    const logMessage = [
      `Method: ${tokens.method(req, res)}`,
      `URL: ${tokens.url(req, res)}`,
      `Status: ${tokens.status(req, res)}`,
      `User: ${tokens.user(req, res)}`,
      `Response Time: ${tokens['response-time'](req, res)} ms`,
      `Date: ${tokens.date(req, res)}`,
      req.method !== 'GET' ? `Body: ${tokens.body(req, res)}` : '',
    ].filter(Boolean).join(' | ');

    // Log based on status code
    const status = parseInt(tokens.status(req, res));
    if (status >= 500) {
      logger.error(logMessage);
    } else if (status >= 400) {
      logger.warn(logMessage);
    } else {
      logger.log(logMessage);
    }

    return null;
  }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Create docs directory if it doesn't exist
  const docsDir = path.resolve(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Skill Matrix API')
    .setDescription('API documentation for Skill Matrix application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Save swagger.json
  const swaggerJson = path.join(docsDir, 'swagger.json');
  fs.writeFileSync(swaggerJson, JSON.stringify(document, null, 2));

  // Setup Swagger UI
  SwaggerModule.setup('docs', app, document);

  // Generate PDF using puppeteer
  const pdfPath = path.join(docsDir, 'api-documentation.pdf');
  
  try {
    // Add routes to serve documentation using Express directly
    const express = app.getHttpAdapter().getInstance();
    
    express.get('/docs/pdf', (req: Request, res: Response) => {
      if (fs.existsSync(pdfPath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=api-documentation.pdf');
        res.sendFile(pdfPath);
      } else {
        res.status(404).send('PDF documentation not found');
      }
    });

    express.get('/docs/swagger.json', (req: Request, res: Response) => {
      if (fs.existsSync(swaggerJson)) {
        res.setHeader('Content-Type', 'application/json');
        res.sendFile(swaggerJson);
      } else {
        res.status(404).send('Swagger JSON not found');
      }
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);

    // Generate PDF after server is running
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Wait for swagger UI to load completely
    await page.goto(`http://localhost:${port}/docs`, {
      waitUntil: 'networkidle0',
    });

    // Wait for swagger UI to render and expand all sections
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          // Get all operation elements and click them
          const elements = window.document.getElementsByClassName('opblock-summary');
          Array.from(elements).forEach((element) => {
            (element as HTMLElement).click();
          });
          resolve();
        }, 2000);
      });
    });

    // Additional wait to ensure all content is expanded
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate PDF
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true
    });

    await browser.close();

    logger.log(`API documentation PDF generated at: ${pdfPath}`);
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`Swagger documentation available at: http://localhost:${port}/docs`);
    logger.log(`PDF documentation available at: http://localhost:${port}/docs/pdf`);
    logger.log(`Swagger JSON available at: http://localhost:${port}/docs/swagger.json`);
  } catch (error) {
    logger.error('Failed to generate documentation:', error);
  }
}

bootstrap();
