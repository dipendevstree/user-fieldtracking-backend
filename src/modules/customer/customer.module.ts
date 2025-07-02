import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "./customer.entity";
import { JwtService } from "@nestjs/jwt";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
import { CustomerContactModule } from "../customerContact/customerContact.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    forwardRef(() => CustomerContactModule),
  ],
  providers: [CustomerService, JwtService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule {}
