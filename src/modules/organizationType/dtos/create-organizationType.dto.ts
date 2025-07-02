import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateOrganizationTypeDto {
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
