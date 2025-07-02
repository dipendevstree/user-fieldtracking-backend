import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MinLength, IsEmail } from "class-validator";

export class AdminLoginDto {
  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString({ message: "Password is required" })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(2)
  readonly password: string;
}
