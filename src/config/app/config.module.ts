import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppConfigService } from "./config.service";
import configuration from "./configuration";
import * as Joi from "joi";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            validationSchema: Joi.object({
                APP_NAME: Joi.string().default("NSC system"),
                APP_ENV: Joi.string().valid("development", "production", "test").default("development"),
                APP_URL: Joi.string().default("http://my-app.test"),
                DB_PORT: Joi.number().default(3000),
                JWT_SECRET: Joi.string().default("JWT_SECRET"),
            }),
        }),
    ],
    providers: [ConfigService, AppConfigService],
    exports: [ConfigService, AppConfigService],
})
export class AppConfigModule {}
