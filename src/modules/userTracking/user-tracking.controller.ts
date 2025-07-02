import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Req,
  UseGuards,
  Res,
} from "@nestjs/common";
import { UserTrackingService } from "./user-tracking.service";
import { CreateUserTrackingDto } from "./dtos/create-user-tracking.dto";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/modules/auth/jwt-auth.guard";
import { RolesGuard } from "src/modules/auth/role-auth-guard";
import { commonResponse } from "helper";
import moment from "moment-timezone";

@ApiTags("UserTracking")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("user-tracking")
export class UserTrackingController {
  constructor(private readonly userTrackingService: UserTrackingService) {}

  @Post("/create")
  async create(
    @Req() req,
    @Res() res: Response,
    @Body() dto: CreateUserTrackingDto
  ) {
    const schemaName = req.user.schemaName;
    dto["userId"] = req.user.id;
    dto["date"] = moment(dto.date, "DD-MM-YYYY").toISOString();
    dto["organizationId"] = req.user.organizationID;
    let result = await this.userTrackingService.create(dto, schemaName);
    return commonResponse.success(
      "en",
      res,
      "USER_TRACKING_CREATED_SUCCESS",
      201,
      result
    );
  }

  @Get("/list")
  @ApiQuery({
    name: "visitId",
    required: false,
    type: String,
    example: "uuid",
    description: "Filer by organizationTypeId",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    example: "2025-01-31",
    description: "End date",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    example: "2025-01-01",
    description: "Start date",
  })
  async findAll(@Req() req, @Res() res: Response) {
    const tenantId = req.user?.schemaName;
    req.query["organizationId"] = req.user.organizationID;
    req.query["timeZone"] = req.user.timeZone;
    req.query["userId"] = req.user.id;
    let result = await this.userTrackingService.findAll(tenantId, req.query);
    return commonResponse.success(
      "en",
      res,
      "USER_TRACKING_LIST_SUCCESS",
      201,
      result
    );
  }

  @Get("user/:userId")
  @ApiQuery({
    name: "visitId",
    required: false,
    type: String,
    example: "uuid",
    description: "Filer by organizationTypeId",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    example: "2025-01-01",
    description: "Start date",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    example: "2025-01-31",
    description: "End date",
  })
  async findByUserId(@Param("userId") userId: string, @Req() req) {
    const tenantId = req.user?.schemaName;
    req.query["organizationId"] = req.user.organizationID;
    req.query["timeZone"] = req.user.timeZone;
    req.query["userId"] = userId;
    return this.userTrackingService.findAll(tenantId, req.query);
  }

  @Delete()
  async deleteAll(@Req() req) {
    const tenantId = req.user?.schemaName;
    return this.userTrackingService.deleteAll(tenantId);
  }
}
