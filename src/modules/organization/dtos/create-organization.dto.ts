import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateOrgDto {
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
  adminName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  adminEmail: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  adminPhone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  adminPhoneCountryCode: string;

  @IsString()
  @ApiProperty()
  @IsOptional()
  adminJobTitle: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({ type: [String], description: "Array of menu IDs" })
  menuIds: string[];

  @IsBoolean()
  @ApiProperty({ default: false })
  is_separate_schema: boolean;
}
