import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";

export enum USER_APPROVAL_STATUS {
  VERIFIED = "verified",
  REJECTED = "rejected",
}
export class ActiveUserBySuperAdminDto {
  @ApiProperty()
  @IsNotEmpty({ message: "UserId is required" })
  readonly userId: string;

  @ApiProperty({
    enum: USER_APPROVAL_STATUS,
    description: "User approval status: verified or rejected",
    example: USER_APPROVAL_STATUS.VERIFIED,
  })
  @IsEnum(USER_APPROVAL_STATUS, {
    message: `Status must be one of: ${Object.values(USER_APPROVAL_STATUS).join(", ")}`,
  })
  readonly status: USER_APPROVAL_STATUS;
}
