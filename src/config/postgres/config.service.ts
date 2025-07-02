import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PostgresConfigService {
  constructor(private readonly configService: ConfigService) {}

  get db_host(): string {
    return this.configService.get<string>("DB_HOST");
  }
  get db_port(): number {
    return Number(this.configService.get<number>("DB_PORT"));
  }
  get db_username(): string {
    return this.configService.get<string>("DB_USERNAME");
  }
  get db_password(): string {
    return this.configService.get<string>("DB_PASSWORD");
  }
  get db_name(): string {
    return this.configService.get<string>("DB_NAME");
  }
  get port(): string {
    return this.configService.get<string>("PORT");
  }
}
