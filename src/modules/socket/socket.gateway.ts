import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Injectable, Logger } from "@nestjs/common";

import { UsersService } from "../users/user.service";

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 2e6,
  upgrades: ["websocket"],
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly usersService: UsersService) {}
  private readonly logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  server: Server;

  // 🔌 When any client (mobile or admin) connects
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // ❌ When a client disconnects
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // 📍 [MOBILE] Employee registers on connection
  @SubscribeMessage("user_joined")
  handleRegisterEmployee(
    @MessageBody() data: { userId: string },
    client: Socket
  ) {
    const room = `user_${data.userId}`;
    client.join(room);
    this.logger.log(`User joined room: ${room}`);
  }

  // 📡 [MOBILE] Sends live location updates
  @SubscribeMessage("location_update")
  handleLocationUpdate(
    @MessageBody() data: { userId: string; lat: number; long: number }
  ) {
    const room = `web_${data.userId}`;
    const payload = {
      userId: data.userId,
      lat: data.lat,
      long: data.long,
      timestamp: new Date().toISOString(),
    };
    this.server.to(room).emit("live_location", payload);
  }

  // 🖥️ [ADMIN] Starts tracking a specific employee
  @SubscribeMessage("track_user")
  handleTrackEmployee(@MessageBody() data: { userId: string }, client: Socket) {
    const room = `web_${data.userId}`;
    client.join(room);
    this.logger.log(`Web joined room: ${room}`);
  }

  // 🔄 [ADMIN] Stops tracking a specific employee
  @SubscribeMessage("untrack_user")
  handleUntrackEmployee(
    @MessageBody() data: { userId: string },
    client: Socket
  ) {
    const room = `web_${data.userId}`;
    client.leave(room);
    this.logger.log(`Web left room: ${room}`);
  }
}
