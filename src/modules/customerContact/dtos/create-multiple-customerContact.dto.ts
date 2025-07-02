import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ValidateNested, ArrayMinSize } from "class-validator";
import { CreateCustomerContactDto } from "./create-customerContact.dto";

export class CreateMultipleCustomerContactsDto {
  @ApiProperty({
    type: [CreateCustomerContactDto],
    description: "Array of customer contacts to create",
  })
  @ValidateNested({ each: true })
  @Type(() => CreateCustomerContactDto)
  @ArrayMinSize(1)
  contacts: CreateCustomerContactDto[];
}
