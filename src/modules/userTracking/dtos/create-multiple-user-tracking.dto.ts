import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { CreateUserTrackingDto } from "./create-user-tracking.dto";

export class CreateMultipleUserTrackingDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateUserTrackingDto)
  @ApiProperty({ type: [CreateUserTrackingDto] })
  data: CreateUserTrackingDto[];
}
