import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  readonly new_password: string;
  @ApiProperty()
  @IsString()
  @MinLength(3)
  readonly token: string;
}
