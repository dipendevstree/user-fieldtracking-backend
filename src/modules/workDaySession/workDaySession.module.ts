import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkDaySession } from "./workDaySession.entity";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
import { WorkDaySessionService } from "./workDaySession.service";
import { WorkDaySessionController } from "./workDaySession.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkDaySession]),
    forwardRef(() => AuthModule),
  ],
  providers: [WorkDaySessionService, JwtService],
  controllers: [WorkDaySessionController],
  exports: [WorkDaySessionService],
})
export class WorkDaySessionModule {}
