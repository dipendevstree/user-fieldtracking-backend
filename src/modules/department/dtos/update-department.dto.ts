import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsBoolean } from "class-validator";

export class UpdateDepartmentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  departmentName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  departmentKey: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
