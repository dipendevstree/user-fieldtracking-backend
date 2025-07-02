import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUserTerritoryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
