import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { InjectSwagger } from './core/injectors';
import AppConfig from './configs/app.config';
import { INestApplication } from '@nestjs/common';

// Export the bootstrap function to be used by consumers of the library
export async function bootstrap(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: true,
  });

  InjectSwagger(app);

  const port = AppConfig.APP.PORT || 3000;
  await app.listen(port);

  console.log(`Nestbox AI Document API server started on port ${port}`);

  return app;
}

// If this file is called directly, run the bootstrap function
if (require.main === module) {
  bootstrap();
}
