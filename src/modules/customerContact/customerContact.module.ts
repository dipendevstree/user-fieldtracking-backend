import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerContact } from "./customerContact.entity";
import { CustomerContactService } from "./customerContact.service";
import { CustomerContactController } from "./customerContact.controller";

import { JwtService } from "@nestjs/jwt";
import { CustomerModule } from "../customer/customer.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerContact]),
    forwardRef(() => CustomerModule),
  ],
  providers: [CustomerContactService, JwtService],
  controllers: [CustomerContactController],
  exports: [CustomerContactService],
})
export class CustomerContactModule {}
