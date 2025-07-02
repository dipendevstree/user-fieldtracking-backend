import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateEmployeeRangDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeRange: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
