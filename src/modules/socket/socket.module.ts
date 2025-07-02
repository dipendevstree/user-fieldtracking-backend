import { forwardRef, Module } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";
import { UsersModule } from "../users/user.module";

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
