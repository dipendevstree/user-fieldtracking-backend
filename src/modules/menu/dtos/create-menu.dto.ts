import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMenuDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  menuName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  parentMenuId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  menuKey: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isDependentOnOtherModule: boolean;
}
