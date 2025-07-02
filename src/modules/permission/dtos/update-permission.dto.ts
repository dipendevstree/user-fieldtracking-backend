import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class UpdatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  orgID: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  menuId: string;

  @IsBoolean()
  @ApiProperty()
  viewOwn: boolean;

  @IsBoolean()
  @ApiProperty()
  viewGlobal: boolean;

  @IsBoolean()
  @ApiProperty()
  add: boolean;

  @IsBoolean()
  @ApiProperty()
  edit: boolean;

  @IsBoolean()
  @ApiProperty()
  delete: boolean;
}
