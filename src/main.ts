import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { json, urlencoded } from "body-parser";
import { ResponseInterceptor } from "./interceptors/response.interceptor";
import { CustomExceptionFilter } from "./exceptions.filter";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { APP_VERSION } from "helper/constants";
// import { PostgresConfigService } from "./config/postgres/config.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    cors: true,
  });

  // const appConfig = app.get(PostgresConfigService);

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
  app.setGlobalPrefix("api");

  // Setting version
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: APP_VERSION,
  });

  app.enableCors({
    origin: "*",
  });

  if ("production" !== process.env.NODE_ENV) {
    const httpAdapter = app.getHttpAdapter();

    // Add new versions here — everything else is automatic
    const API_VERSIONS = ["1", "2"];

    const swaggerUrls = API_VERSIONS.map((version) => {
      const config = new DocumentBuilder()
        .addBearerAuth()
        .setTitle(`UserFieldtrack360 - V${version}`)
        .setDescription(`UserFieldtrack360 API Documentation (Version ${version})`)
        .setVersion(version)
        .build();

      const document = SwaggerModule.createDocument(app, config);

      // Filter to only include paths for this version
      Object.keys(document.paths).forEach((path) => {
        if (!path.includes(`/v${version}/`)) {
          delete document.paths[path];
          return;
        }
        const pathItem = document.paths[path];
        Object.keys(pathItem).forEach((method) => {
          pathItem[method].parameters ??= [];
        });
      });

      // Serve JSON spec for this version
      const jsonUrl = `/api/v${version}/docs-json`;
      httpAdapter.get(jsonUrl, (req, res) => res.json(document));

      return { url: jsonUrl, name: `Version ${version}` };
    });

    // Single Swagger UI with version dropdown
    SwaggerModule.setup("api/docs", app, null, {
      explorer: true,
      swaggerOptions: {
        spec: undefined,
        urls: swaggerUrls,
        "urls.primaryName": swaggerUrls[0]?.name,
        persistAuthorization: true,
      },
    } as any);
  }

  const port = process.env.PORT || 4002 // appConfig.port;

  await app.listen(port);
  console.log(`Application is running ▶️ http://localhost:${port}`);
}
bootstrap();
