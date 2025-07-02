import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateUserTerritoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
