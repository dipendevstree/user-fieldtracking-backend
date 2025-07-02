import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty({ message: "otp is required" })
  readonly otp: number;
}
