import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateCustomerContactDto } from "../../customerContact/dtos/create-customerContact.dto";

export class CreateCustomerDto {
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

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  country: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  additionalNotes: string;

  @ApiProperty({
    type: [CreateCustomerContactDto],
    description: "List of customer contacts to be created with the customer",
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerContactDto)
  @IsNotEmpty()
  customerContacts: CreateCustomerContactDto[];
}
