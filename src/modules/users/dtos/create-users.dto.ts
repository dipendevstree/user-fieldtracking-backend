import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tierkey: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty()
  @IsString()
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
  @IsNotEmpty()
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
  territoryId: string;
}
