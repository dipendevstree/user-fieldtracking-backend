import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class UpdateOrgDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  organizationName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  industryId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  employeeRangeId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  organizationTypeId: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  website: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  description: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  address: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  country: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  city: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  zipCode: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  state: string;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({ type: [String], description: "Array of menu IDs" })
  menuIds: string[];
}
