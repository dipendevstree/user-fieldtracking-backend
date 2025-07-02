import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsArray,
} from "class-validator";

export class UpdateVisitDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  date: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  time: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  purpose: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  customerId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  customerContactId: string;

  @IsIn(["Low", "Medium", "High"])
  @IsOptional()
  @ApiProperty()
  priority: "Low" | "Medium" | "High";

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
  preparationNotes: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: "Selected meeting outcomes",
    example: ["Follow-up Needed", "Pricing Discussed"],
    isArray: true,
  })
  meetingOutcomes: string[];
}
