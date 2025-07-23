import { forwardRef, Module } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";
import { UserTrackingModule } from "../userTracking/user-tracking.module";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [
    forwardRef(() => UserTrackingModule),
    forwardRef(() => RedisModule),
  ],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
