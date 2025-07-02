import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsNotEmpty, IsBoolean } from "class-validator";

export class UpdateSuperAdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
