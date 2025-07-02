import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "body-parser";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { CustomExceptionFilter } from "./exceptions.filter";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { PostgresConfigService } from "./config/postgres/config.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: true,
  });

  const appConfig = app.get(PostgresConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new CustomExceptionFilter());
  app.setGlobalPrefix("api/v1");
  app.enableCors({
    origin: "*",
  });

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle("Fieldtrack")
    .setDescription("API Documentation")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, config);

  Object.keys(document.paths).forEach((path) => {
    const pathItem = document.paths[path];
    Object.keys(pathItem).forEach((method) => {
      const operation = pathItem[method];
      operation.parameters ??= [];
    });
  });

  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = appConfig.port;

  await app.listen(port);
  console.log(`Application is running ▶️ http://localhost:${port}`);
}
bootstrap();
