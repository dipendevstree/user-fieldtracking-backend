import * as Joi from "joi";
import { Module } from "@nestjs/common";
import configuration from "./configuration";
import { PostgresConfigService } from "./config.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
/**
 * Import and provide app configuration related classes.
 *
 * @module
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
            validationSchema: Joi.object({
                DB_HOST: Joi.string().default("localhost"),
                DB_PORT: Joi.number().default(5432),
                DB_USERNAME: Joi.string().default("postgres"),
                DB_PASSWORD: Joi.string().default("aesha12"),
                DB_NAME: Joi.string().default("nscsystem"),
            }),
        }),
    ],
    providers: [ConfigService, PostgresConfigService],
    exports: [ConfigService, PostgresConfigService],
})
export class PostgresConfigModule {}
