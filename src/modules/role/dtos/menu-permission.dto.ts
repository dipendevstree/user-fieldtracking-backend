import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class MenuPermissionDto {
  @IsString()
  @ApiProperty({ description: "Menu ID" })
  id: string;

  @IsString()
  @ApiProperty({ description: "Permission ID" })
  @IsOptional()
  permissionId: string;

  @IsBoolean()
  @ApiProperty()
  add: boolean;

  @IsBoolean()
  @ApiProperty()
  viewGlobal: boolean;

  @IsBoolean()
  @ApiProperty()
  viewOwn: boolean;

  @IsBoolean()
  @ApiProperty()
  edit: boolean;

  @IsBoolean()
  @ApiProperty()
  deleteValue: boolean;
}
