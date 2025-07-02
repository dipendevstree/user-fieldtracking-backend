import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsBoolean } from "class-validator";

export class UpdateIndustryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  industryName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
