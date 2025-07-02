import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from "class-validator";

export class UpdateMenuDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  menuName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  menuKey: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isDependentOnOtherModule: boolean;
}
