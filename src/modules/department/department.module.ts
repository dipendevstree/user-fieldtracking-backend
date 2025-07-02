import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DepartmentController } from "./department.controller";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { Department } from "./department.entity";
import { DepartmentService } from "./department.service";

@Module({
  imports: [TypeOrmModule.forFeature([Department]), AuthModule],
  controllers: [DepartmentController],
  providers: [DepartmentService, JwtService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
