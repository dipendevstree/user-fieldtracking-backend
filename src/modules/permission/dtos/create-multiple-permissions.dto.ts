import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, ValidateNested } from "class-validator";
import { CreatePermissionDto } from "./create-permission.dto"; // Adjust the path if needed

export class CreateMultiplePermissionsDto {
  @IsArray()
  @ArrayMinSize(1, { message: "At least one permission must be provided." })
  @ValidateNested({ each: true })
  @Type(() => CreatePermissionDto)
  @ApiProperty({
    type: [CreatePermissionDto],
    description: "Array of permission objects to create",
  })
  permissions: CreatePermissionDto[];
}
