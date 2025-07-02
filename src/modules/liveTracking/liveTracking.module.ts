import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LiveTracking } from "./liveTracking.entity";
import { LiveTrackingService } from "./liveTracking.service";
import { LiveTrackingController } from "./liveTracking.controller";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    TypeOrmModule.forFeature([LiveTracking]),
    forwardRef(() => AuthModule),
  ],
  providers: [LiveTrackingService, JwtService],
  controllers: [LiveTrackingController],
  exports: [LiveTrackingService],
})
export class LiveTrackingModule {}
