import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsIn, IsArray, Matches } from "class-validator";
import { VISIT_STATUS } from "helper/constants";

export class CheckoutVisitDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  date: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  time: string;

  @IsIn([
    VISIT_STATUS.CANCEL,
    VISIT_STATUS.COMPLETED,
    VISIT_STATUS.PARTIAL_COMPLETED,
  ])
  @IsOptional()
  @ApiProperty({ example: "completed" })
  status: "cancel" | "completed" | "partial_completed";

  @IsString()
  @IsOptional()
  @ApiProperty()
  meetingNotes: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  nextActions: string;

  @ApiProperty({
    description: "Follow-up date in DD-MM-YYYY format (optional)",
    example: "28-06-2025",
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(0\d|[12]\d|3[01])-(0\d|1[0-2])-\d{4}$/, {
    message: "followUpDate must be in DD-MM-YYYY format",
  })
  followUpDate?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: "Selected meeting outcomes",
    example: ["Follow-up Needed", "Pricing Discussed"],
    isArray: true,
  })
  meetingOutcomes: string[];
}
