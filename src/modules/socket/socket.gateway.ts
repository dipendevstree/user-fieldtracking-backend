import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { UserTrackingService } from "../userTracking/user-tracking.service";

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
  constructor(
    @Inject(forwardRef(() => UserTrackingService))
    private readonly userTrackingService: UserTrackingService
  ) {}
  private readonly logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  server: Server;

  // 🔌 When any client (mobile or admin) connects
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // ❌ When a client disconnects
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // 📍 [MOBILE] Employee registers on connection
  @SubscribeMessage("user_joined")
  handleRegisterEmployee(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket
  ) {
    const room = `user_${data.userId}`;
    client.join(room);
    console.log(`🔌 user_joined → Joined room: ${room}`);
  }

  emitLiveLocation(data: any) {
    const room = `web_${data.userId}`;
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    try {
      const roomInfo = this.server.sockets.adapter.rooms.get(room);
      const numberOfClients = roomInfo ? roomInfo.size : 0;

      if (numberOfClients > 0) {
        this.server.to(room).emit("live_location", payload);
        console.log(`📡 location_update → Sent to room: ${room}`, payload);
      } else {
        console.log(`⚠️ Room ${room} is empty. Skipping emit.`);
      }
    } catch (error) {
      console.error("❌ Emit error:", error.message);
    }
  }

  // 📡 [MOBILE] Sends live location updates
  @SubscribeMessage("location_update")
  handleLocationUpdate(
    @MessageBody()
    data: any
  ) {
    const room = `web_${data.userId}`;
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    const roomInfo = this.server.sockets.adapter.rooms.get(room);
    const numberOfClients = roomInfo ? roomInfo.size : 0;

    if (numberOfClients > 0) {
      this.server.to(room).emit("live_location", payload);
      console.log(`📡 location_update → Sent to room: ${room}`);
    } else {
      console.log(`⚠️ Room ${room} is empty. Skipping emit.`);
    }
    console.log(`📡 location_update → Sent to room: ${room}`, payload);
    this.userTrackingService.create(payload, data.schemaName);
  }

  // 🖥️ [ADMIN] Starts tracking a specific employee
  @SubscribeMessage("track_user")
  handleTrackEmployee(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket
  ) {
    const room = `web_${data.userId}`;
    client.join(room);
    console.log(`🖥️ track_user → Admin joined room: ${room}`);
  }

  // 🔄 [ADMIN] Stops tracking a specific employee
  @SubscribeMessage("untrack_user")
  handleUntrackEmployee(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket
  ) {
    const room = `web_${data.userId}`;
    client.leave(room);
    console.log(`❌ untrack_user → Admin left room: ${room}`);
  }
}
