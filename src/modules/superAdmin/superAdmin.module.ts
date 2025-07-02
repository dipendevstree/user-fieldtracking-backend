import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SuperAdmin } from "./superAdmin.entity";
import { SuperAdminService } from "./superAdmin.service";
import { SuperAdminController } from "./superAdmin.controller";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [TypeOrmModule.forFeature([SuperAdmin])],
  controllers: [SuperAdminController],
  providers: [SuperAdminService, JwtService],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
