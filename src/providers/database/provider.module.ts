import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { PostgresConfigModule } from "../../config/postgres/config.module";
import { PostgresConfigService } from "./../../config/postgres/config.service";

@Module({
    imports: [
        PostgresConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [PostgresConfigModule],
            useFactory: async (postgresConfigService: PostgresConfigService) => ({
                type: "postgres",
                host: postgresConfigService.db_host,
                port: postgresConfigService.db_port,
                username: postgresConfigService.db_username,
                password: postgresConfigService.db_password,
                database: postgresConfigService.db_name,
                entities: [__dirname + "/../../**/*.entity{.ts,.js}"],
                synchronize: true, // Set to false in production
            }),
            inject: [PostgresConfigService],
        } as TypeOrmModuleAsyncOptions),
    ],
})
export class PostgresDatabaseProviderModule {}
