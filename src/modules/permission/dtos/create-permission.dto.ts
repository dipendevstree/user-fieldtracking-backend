import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  organizationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  organizationMenuId: string;

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

  @IsString()
  @IsOptional()
  @ApiProperty()
  createdBy: string;
}
