import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { MenuPermissionDto } from "./menu-permission.dto";

export class UpdateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuPermissionDto)
  @ApiProperty({
    type: [MenuPermissionDto],
    description: "Array of menu permissions",
  })
  menuIds: MenuPermissionDto[];
}
