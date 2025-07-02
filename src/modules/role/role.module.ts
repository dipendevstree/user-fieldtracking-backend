import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "./role.entity";
import { RoleService } from "./role.service";
import { RoleController } from "./role.controller";
import { JwtService } from "@nestjs/jwt";
import { MenuModule } from "../menu/menu.module";
import { OrganizationMenuModule } from "../organizationMenu/organizationMenu.module";
import { PermissionModule } from "../permission/permission.module";
import { UsersModule } from "../users/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    forwardRef(() => MenuModule),
    forwardRef(() => OrganizationMenuModule),
    forwardRef(() => PermissionModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [RoleController],
  providers: [RoleService, JwtService],
  exports: [RoleService],
})
export class RoleModule {}
