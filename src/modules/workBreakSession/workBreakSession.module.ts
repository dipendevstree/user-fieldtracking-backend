import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkBreakSession } from "./workBreakSession.entity";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { WorkBreakSessionService } from "./workBreakSession.service";
import { WorkBreakSessionController } from "./workBreakSession.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkBreakSession]),
    forwardRef(() => AuthModule),
  ],
  providers: [WorkBreakSessionService, JwtService],
  controllers: [WorkBreakSessionController],
  exports: [WorkBreakSessionService],
})
export class WorkBreakSessionModule {}
