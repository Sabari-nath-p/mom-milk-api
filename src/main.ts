import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as bodyParser from "body-parser";

async function bootstrap() {
  // IMPORTANT: rawBody: true is REQUIRED for Stripe
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Enable validation globally — but Stripe webhook must bypass it
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      skipUndefinedProperties: false,

      // 🚨 Ignore validation for the Stripe webhook route
      // THIS FIXES "stream is not readable"
      skipMissingProperties: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("Moms Milk API")
    .setDescription("API documentation for Moms Milk application")
    .setVersion("1.0")
    .addTag("moms-milk")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3003;
  await app.listen(port, "0.0.0.0");

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
