import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsString,
  Matches,
} from "class-validator";
import { VisitEntryDto } from "./create-visit.dto";

export class CreateMultiVisitDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  salesRepresentativeUserId: string;

  @ApiProperty({
    description: "Date of the meeting in DD-MM-YYYY format",
    example: "25-06-2025",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0\d|[12]\d|3[01])-(0\d|1[0-2])-\d{4}$/, {
    message: "followUpDate must be in DD-MM-YYYY format",
  })
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisitEntryDto)
  @ApiProperty({ type: [VisitEntryDto] })
  visits: VisitEntryDto[];
}
