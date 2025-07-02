import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  Matches,
} from "class-validator";

export class UpdateWorkDaySessionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Matches(/^(0\d|[12]\d|3[01])-(0\d|1[0-2])-\d{4}$/, {
    message: "date must be in DD-MM-YYYY format",
  })
  date: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty()
  startTime?: Date;

  @IsDateString()
  @IsOptional()
  @ApiProperty()
  endTime?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty()
  vehicleType?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  startOdometer?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  endOdometer?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  organizationId: string;
}
