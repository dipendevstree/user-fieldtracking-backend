import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
} from "class-validator";

export class UpdateWorkBreakSessionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  breakType: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty()
  breakStartTime: Date;

  @IsDateString()
  @IsOptional()
  @ApiProperty()
  breakEndTime?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  workDaySessionId: string;
}
