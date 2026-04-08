import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";

export class CreateUserTrackingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  workDaySessionId: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  lat: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  speed: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  long: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Matches(/^(0\d|[12]\d|3[01])-(0\d|1[0-2])-\d{4}$/, {
    message: "date must be in DD-MM-YYYY format",
  })
  date: string;
}
