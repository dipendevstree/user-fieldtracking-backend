import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateCustomerTypeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  typeName: string;
}
