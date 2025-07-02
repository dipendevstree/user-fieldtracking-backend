import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsBoolean } from "class-validator";

export class UpdateOrganizationTypeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationTypeName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organizationTypeKey: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
