import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class SendOtpDto {
  @ApiProperty()
  @IsNotEmpty({ message: "phoneNumber is required" })
  readonly phoneNumber: string;

  @ApiProperty()
  @IsNotEmpty({ message: "countryCode is required" })
  readonly countryCode: string;
}
