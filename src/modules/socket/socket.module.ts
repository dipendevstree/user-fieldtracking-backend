import { forwardRef, Module } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";
import { UsersModule } from "../users/user.module";
import { UserTrackingModule } from "../userTracking/user-tracking.module";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => UserTrackingModule),
  ],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
