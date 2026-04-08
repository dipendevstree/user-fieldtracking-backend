import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { UsersService } from "./user.service";
import { UsersController } from "./user.controller";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";
// import { OrganizationModule } from "../organization/organization.module";

@Module({
  imports: [
    // TypeOrmModule.forFeature([User]),
    AuthModule,
    // forwardRef(() => OrganizationModule),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService],
  exports: [UsersService],
})
export class UsersModule {}
