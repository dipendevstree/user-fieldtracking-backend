import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  Matches,
} from "class-validator";

export class StartWorkDaySessionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Matches(/^(0\d|[12]\d|3[01])-(0\d|1[0-2])-\d{4}$/, {
    message: "date must be in DD-MM-YYYY format",
  })
  date: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  vehicleType?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  vehicleCategory?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  startOdometer?: string;
}
