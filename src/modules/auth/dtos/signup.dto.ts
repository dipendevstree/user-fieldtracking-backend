import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsNotEmpty, IsOptional } from "class-validator";

export class SignUpDto {
  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

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
  @IsOptional()
  departmentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  jobTitle: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  orgName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  orgWebsite: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  orgDescription: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  orgAddress: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  orgCountry: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  orgCity: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  orgState: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  orgZipcode: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  orgTypeId: string;
}
