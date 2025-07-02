import { Module } from "@nestjs/common";
import { UserTrackingService } from "./user-tracking.service";
import { UserTrackingController } from "./user-tracking.controller";
import { GetModelForCompany } from "src/middleware/dynamic-model.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [UserTrackingController],
  providers: [UserTrackingService, GetModelForCompany, JwtService],
  exports: [UserTrackingService],
})
export class UserTrackingModule {}
