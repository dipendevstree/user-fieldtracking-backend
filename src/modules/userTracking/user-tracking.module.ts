import { forwardRef, Module } from "@nestjs/common";
import { UserTrackingService } from "./user-tracking.service";
import { UserTrackingControllerV1 } from "./user-tracking.controller.v1";
import { GetModelForCompany } from "src/middleware/dynamic-model.service";
import { JwtService } from "@nestjs/jwt";
import { RedisModule } from "../redis/redis.module";
import { RedisService } from "../redis/redis.service";
import { SocketModule } from "../socket/socket.module";
import { UserTrackingControllerV2 } from "./user-tracking.controller.v2";

@Module({
  imports: [forwardRef(() => RedisModule), forwardRef(() => SocketModule)],
  controllers: [UserTrackingControllerV1, UserTrackingControllerV2],
  providers: [
    UserTrackingService,
    GetModelForCompany,
    JwtService,
    RedisService,
  ],
  exports: [UserTrackingService],
})
export class UserTrackingModule {}
