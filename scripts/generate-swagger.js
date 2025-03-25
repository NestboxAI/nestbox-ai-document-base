const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

// Adjust this path as needed to point to your compiled JS module
const { AppModule } = require('../dist/app.module');

async function generateSwagger() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Nestbox API Documents API')
    .setDescription('API for Nestbox Documents, control your documents')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outputPathJSON = resolve(process.cwd(), 'nestbox-ai-documents.json');

  // Write JSON
  writeFileSync(outputPathJSON, JSON.stringify(document, null, 2), 'utf8');
  console.log(`Swagger JSON file generated at ${outputPathJSON}`);

  process.exit(0);
}

generateSwagger();
