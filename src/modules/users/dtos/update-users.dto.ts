import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsArray,
  IsUUID,
  IsBoolean,
} from "class-validator";

export class UpdateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  countryCode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  roleId: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  reportingToRoleId: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  jobTitle: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  departmentId: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ default: false })
  isWebUser: boolean;

  @IsArray()
  @IsUUID("all", { each: true })
  @IsNotEmpty()
  @ApiProperty({
    description: "IDs of users this user reports to",
    example: ["uuid-1", "uuid-2"],
    required: false,
  })
  reportingToIds: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  tierkey?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  territoryId: string;
}
