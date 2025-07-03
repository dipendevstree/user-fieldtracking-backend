import { Module, forwardRef } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RedisController } from "./redis.controler";
import { UsersModule } from "../users/user.module";
import { UsersService } from "../users/user.service";

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [RedisService, UsersService],
  controllers: [RedisController],
  exports: [RedisService], // Makes RedisService available to other modules
})
export class RedisModule {}
