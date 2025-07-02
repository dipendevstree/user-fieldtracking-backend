import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrganizationTypeController } from "./organizationType.controller";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { OrganizationType } from "./organizationType.entity";
import { OrganizationTypeService } from "./organizationType.service";

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationType]), AuthModule],
  controllers: [OrganizationTypeController],
  providers: [OrganizationTypeService, JwtService],
  exports: [OrganizationTypeService],
})
export class OrganizationTypeModule {}
