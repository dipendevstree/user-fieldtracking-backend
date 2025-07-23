import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";

export class CreateMultipleUserTrackingDto {
  @IsOptional()
  @ApiProperty()
  location: any;

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
  workDaySessionId: string;
}
