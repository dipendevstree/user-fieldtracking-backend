import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrganizationController } from "./organization.controller";
import { JwtService } from "@nestjs/jwt";
import { UsersModule } from "../users/user.module";
import { OrganizationService } from "./organization.service";
import { Organization } from "./organization.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]),
    forwardRef(() => UsersModule),
  ],
  providers: [OrganizationService, JwtService],
  controllers: [OrganizationController],
  exports: [OrganizationService],
})
export class OrganizationModule {}
