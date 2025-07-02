import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsBoolean } from "class-validator";

export class UpdateOrganizationMenuDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  menuName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  menuKey: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  organizationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  masterMenuId: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isActive: boolean;
}
