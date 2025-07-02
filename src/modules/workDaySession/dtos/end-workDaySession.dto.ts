import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  Matches,
} from "class-validator";

export class EndWorkDaySessionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  workDaySessionId: string;
}
