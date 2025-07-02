import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
} from "class-validator";

export class EndWorkBreakSessionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  workBreakSessionId: string;
}
