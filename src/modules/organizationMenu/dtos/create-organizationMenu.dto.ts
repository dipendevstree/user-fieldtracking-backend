import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsBoolean, IsOptional } from "class-validator";

export class CreateOrganizationMenuDto {
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
  @IsOptional()
  @ApiProperty()
  masterMenuId: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  parentMenuId: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isActive: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty()
  createdBy: string;
}
