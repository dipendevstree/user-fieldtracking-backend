import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MailerModule } from "@nestjs-modules/mailer";
import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";
import { UsersModule } from "./modules/users/user.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PostgresDatabaseProviderModule } from "./providers/database/provider.module";
import { PostgresConfigService } from "./config/postgres/config.service";
import { AppConfigModule } from "./config/app/config.module";
import { PostgresConfigModule } from "./config/postgres/config.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LanguageMiddleware } from "./middleware/language.middleware";
import { AppConfigService } from "./config/app/config.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserTrackingModule } from "./modules/userTracking/user-tracking.module";
import { SocketModule } from "./modules/socket/socket.module";
import { RedisModule } from "./modules/redis/redis.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
    }),
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [PostgresConfigModule, PostgresDatabaseProviderModule],
      useFactory: async (postgresConfigService: PostgresConfigService) => ({
        type: "postgres",
        host: postgresConfigService.db_host,
        port: postgresConfigService.db_port,
        username: postgresConfigService.db_username,
        password: postgresConfigService.db_password,
        database: postgresConfigService.db_name,
        // autoLoadEntities: true,
        // entities: [__dirname + "/modules/**/*.entity{.ts,.js}"], // <-- update this line
        // synchronize: false,
      }),
      inject: [PostgresConfigService],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: JSON.parse(process.env.SMTP_SECURE ?? "false"),
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@pax_africana_support.com>',
      },
      template: {
        dir: process.cwd() + "/src/templates/",
        adapter: new EjsAdapter(),
        options: {
          strict: false,
        },
      },
    }),
    UsersModule,
    AuthModule,
    UserTrackingModule,
    SocketModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LanguageMiddleware).forRoutes("*");
  }
}
