import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
} from "class-validator";

export class CreateWorkBreakSessionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  breakType: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  workDaySessionId: string;
}
