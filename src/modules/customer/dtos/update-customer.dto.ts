import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, IsOptional } from "class-validator";

export class UpdateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  organizationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  industryId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  customerTypeId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  streetAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  city: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  state: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  zipCode: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  country: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  additionalNotes: string;
}
