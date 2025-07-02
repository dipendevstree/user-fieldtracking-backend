import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsBoolean } from "class-validator";

export class UpdateEmployeeRangDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeRange: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
