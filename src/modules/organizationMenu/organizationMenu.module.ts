import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrganizationMenu } from "./organizationMenu.entity";

import { JwtService } from "@nestjs/jwt";
import { OrganizationMenuService } from "./organizationMenu.service";
import { OrganizationMenuController } from "./organizationMenu.controller";

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationMenu])],
  providers: [OrganizationMenuService, JwtService],
  controllers: [OrganizationMenuController],
  exports: [OrganizationMenuService],
})
export class OrganizationMenuModule {}
