import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { CustomExceptionsFilter } from './exception_filter/custom_exceptions.filter';

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
    .addBearerAuth()
    .build();
  app.enableCors();
  app.disable('x-powered-by');
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CustomExceptionsFilter(httpAdapterHost));

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const configService = app.get<ConfigService>(ConfigService);

  await app.listen(configService.get<number>('port') ?? 3000);
}
bootstrap();
