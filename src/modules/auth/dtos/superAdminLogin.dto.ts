import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, MinLength } from "class-validator";

export class SuperAdminLoginDto {
  @ApiProperty()
  @IsNotEmpty({ message: "Username is required" })
  readonly username: string;

  @ApiProperty()
  @IsString({ message: "Password is required" })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(2)
  readonly password: string;
}
