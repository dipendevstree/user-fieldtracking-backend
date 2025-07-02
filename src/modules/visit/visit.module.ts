import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Visit } from "./visit.entity";
import { VisitService } from "./visit.service";
import { VisitController } from "./visit.controller";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [TypeOrmModule.forFeature([Visit]), forwardRef(() => AuthModule)],
  providers: [VisitService, JwtService],
  controllers: [VisitController],
  exports: [VisitService],
})
export class VisitModule {}
