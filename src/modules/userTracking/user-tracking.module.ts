import { forwardRef, Module } from "@nestjs/common";
import { UserTrackingService } from "./user-tracking.service";
import { UserTrackingController } from "./user-tracking.controller";
import { GetModelForCompany } from "src/middleware/dynamic-model.service";
import { JwtService } from "@nestjs/jwt";
import { RedisModule } from "../redis/redis.module";
import { RedisService } from "../redis/redis.service";

@Module({
  imports: [forwardRef(() => RedisModule)],
  controllers: [UserTrackingController],
  providers: [
    UserTrackingService,
    GetModelForCompany,
    JwtService,
    RedisService,
  ],
  exports: [UserTrackingService],
})
export class UserTrackingModule {}
