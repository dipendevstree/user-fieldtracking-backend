import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsEmail,
  IsOptional,
} from "class-validator";

export class UpdateCustomerContactDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  organizationID: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  designation: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  isPrimary: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty()
  assignUserId: string;
}
