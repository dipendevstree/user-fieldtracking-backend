import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsEmail,
  IsOptional,
} from "class-validator";

export class CreateCustomerContactDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  customerName: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  customerId: string;

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
  @ApiProperty({ default: false })
  isPrimary: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty()
  assignUserId: string;
}
