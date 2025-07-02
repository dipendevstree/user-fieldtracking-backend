import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeeRang } from "./employeeRang.entity";
import { EmployeeRangService } from "./employeeRang.service";
import { EmployeeRangController } from "./employeeRang.controller";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeRang]), AuthModule],
  controllers: [EmployeeRangController],
  providers: [EmployeeRangService, JwtService],
  exports: [EmployeeRangService],
})
export class EmployeeRangModule {}
