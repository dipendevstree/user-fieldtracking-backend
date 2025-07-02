import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrganizationController } from "./organization.controller";
import { JwtService } from "@nestjs/jwt";
import { UsersModule } from "../users/user.module";
import { OrganizationService } from "./organization.service";
import { Organization } from "./organization.entity";
import { RoleModule } from "../role/role.module";
import { MenuModule } from "../menu/menu.module";
import { OrganizationMenuModule } from "../organizationMenu/organizationMenu.module";
import { PermissionModule } from "../permission/permission.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]),
    forwardRef(() => UsersModule),
    forwardRef(() => RoleModule),
    forwardRef(() => MenuModule),
    forwardRef(() => OrganizationMenuModule),
    forwardRef(() => PermissionModule),
  ],
  providers: [OrganizationService, JwtService],
  controllers: [OrganizationController],
  exports: [OrganizationService],
})
export class OrganizationModule {}
