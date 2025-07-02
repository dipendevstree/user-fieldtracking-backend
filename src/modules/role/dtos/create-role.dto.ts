import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { MenuPermissionDto } from "./menu-permission.dto";
import { Type } from "class-transformer";

export class CreateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuPermissionDto)
  @ApiProperty({
    type: [MenuPermissionDto],
    description: "Array of menu permissions",
  })
  menuIds: MenuPermissionDto[];
}
