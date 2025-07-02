import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class UpdateLiveTrackingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lat: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  long: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  userId: string;
}
