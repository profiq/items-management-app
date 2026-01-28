import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Disabling x-powered-by is specific to the application backend.
  // Default is Express.
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Profiq Reference App')
    .setDescription(
      'API description of the reference app of Profiq for future student pool members'
    )
    .setVersion('0.0.1')
    .build();
  app.enableCors();
  app.disable('x-powered-by');
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
