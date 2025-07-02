import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserTerritory } from "./userTerritory.entity";
import { UserTerritoryService } from "./userTerritory.service";
import { UserTerritoryController } from "./userTerritory.controller";
import { AuthModule } from "../auth/auth.module";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTerritory]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserTerritoryService, JwtService],
  controllers: [UserTerritoryController],
  exports: [UserTerritoryService],
})
export class UserTerritoryModule {}
