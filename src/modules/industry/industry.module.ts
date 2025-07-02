import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Industry } from "./industry.entity";
import { IndustryService } from "./industry.service";
import { IndustryController } from "./industry.controller";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Industry]), AuthModule],
  controllers: [IndustryController],
  providers: [IndustryService, JwtService],
  exports: [IndustryService],
})
export class IndustryModule {}
