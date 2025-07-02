import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { AuthModule } from "../auth/auth.module";
import { CustomerType } from "./customerType.entity";
import { CustomerTypeService } from "./customerType.service";
import { CustomerTypeController } from "./customerType.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerType]),
    forwardRef(() => AuthModule),
  ],
  providers: [CustomerTypeService, JwtService],
  controllers: [CustomerTypeController],
  exports: [CustomerTypeService],
})
export class CustomerTypeModule {}
