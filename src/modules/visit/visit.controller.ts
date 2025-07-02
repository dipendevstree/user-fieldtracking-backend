import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { VisitService } from "./visit.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { commonResponse } from "helper";
import { UpdateVisitDto } from "./dtos/update-visit.dto";
import { VISIT_STATUS } from "helper/constants";
import { CreateMultiVisitDto } from "./dtos/create-multiple-visit.dto";
import { CheckoutVisitDto } from "./dtos/checkout-dto";
import moment from "moment-timezone";

@Controller("visit")
@ApiBearerAuth()
@ApiTags("Visit")
export class VisitController {
  constructor(private readonly visitService: VisitService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async create(
    @Body() createDto: CreateMultiVisitDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schemaName = req.user.schemaName;
      createDto["createdBy"] = req?.user?.id;
      createDto["organizationId"] = req.user.organizationID;
      createDto["status"] = VISIT_STATUS.PENDING;
      const result = await this.visitService.create(createDto, schemaName);
      return commonResponse.success(
        "en",
        res,
        "VISIT_CREATED_SUCCESS",
        201,
        result
      );
    } catch (error) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {
          message: error.message,
        }
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("/list")
  @ApiQuery({ name: "sort", required: false, type: String, example: "dsc" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "priority", required: false, type: String, example: "Low" })
  @ApiQuery({
    name: "status",
    required: false,
    type: String,
    example: VISIT_STATUS.PENDING,
  })
  @ApiQuery({
    name: "customerId",
    required: false,
    type: String,
    example: "uuid",
    description: "Filer by customerId",
  })
  @ApiQuery({
    name: "customerContactId",
    required: false,
    type: String,
    example: "uuid",
    description: "Filer by customerContactId",
  })
  @ApiQuery({
    name: "searchFor",
    required: false,
    type: String,
    description: "Search by purpose",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    example: "2025-01-31",
    description: "Visit end date",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    example: "2025-01-01",
    description: "Visit start date",
  })
  async list(@Req() req: Request, @Res() res: Response) {
    try {
      let schemaName = req.user.schemaName;
      req.query["organizationId"] = req.user.organizationID;
      req.query["timeZone"] = req.user.timeZone;
      const data = await this.visitService.getAll(req.query, schemaName);
      return commonResponse.success("en", res, "VISIT_LIST_SUCCESS", 200, data);
    } catch (error) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {
          message: error.message,
        }
      );
    }
  }
  @Get("/analytics")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    example: "2025-01-31",
    description: "Visit end date",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    example: "2025-01-01",
    description: "Visit start date",
  })
  async getVisitCountAnalytics(@Req() req: Request, @Res() res: Response) {
    try {
      console.log("req.user", req.user);
      req.query["organizationId"] = req.user.organizationID;
      req.query["timeZone"] = req.user.timeZone;
      req.query["salesRepresentativeUserId"] = req.user.id;
      let schemaName = req.user.schemaName;
      const analytics = await this.visitService.getVisitAnalytics(
        req.query,
        schemaName
      );
      return commonResponse.success(
        "en",
        res,
        "VISIT_ANALYTICS",
        200,
        analytics
      );
    } catch (error) {
      console.log("errorerrorerror", error);
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        { message: error.message }
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("/:id")
  async getById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schemaName = req.user.schemaName;
      const data = await this.visitService.getById(id, schemaName);
      return commonResponse.success("en", res, "VISIT_DETAILS", 200, data);
    } catch (error) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {
          message: error.message,
        }
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("/checkin/:id")
  async visitCheckIn(
    @Param("id") id: string,
    @Body() updateDto: any,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schemaName = req.user.schemaName;
      const record = await this.visitService.getById(id, schemaName);
      updateDto["updatedBy"] = req?.user?.id;
      updateDto["organizationId"] = req.user.organizationID;

      Object.assign(record, { status: VISIT_STATUS.CHECKIN });
      const updated = await this.visitService.update(record, schemaName);
      return commonResponse.success(
        "en",
        res,
        "VISIT_UPDATED_SUCCESS",
        200,
        updated
      );
    } catch (error) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {
          message: error.message,
        }
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("/checkout/:id")
  async visitCheckOut(
    @Param("id") id: string,
    @Body() updateDto: CheckoutVisitDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schemaName = req.user.schemaName;
      const record = await this.visitService.getById(id, schemaName);
      updateDto["updatedBy"] = req?.user?.id;
      updateDto["organizationId"] = req.user.organizationID;
      let { followUpDate } = updateDto;
      if (followUpDate) {
        updateDto["followUpDate"] = moment(
          followUpDate,
          "DD-MM-YYYY"
        ).toISOString();
      }
      Object.assign(record, updateDto);
      const updated = await this.visitService.update(record, schemaName);
      return commonResponse.success(
        "en",
        res,
        "VISIT_UPDATED_SUCCESS",
        200,
        updated
      );
    } catch (error) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {
          message: error.message,
        }
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("/patch/:id")
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateVisitDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schemaName = req.user.schemaName;
      const record = await this.visitService.getById(id, schemaName);
      updateDto["updatedBy"] = req?.user?.id;
      updateDto["organizationId"] = req.user.organizationID;
      Object.assign(record, updateDto);
      const updated = await this.visitService.update(record, schemaName);
      return commonResponse.success(
        "en",
        res,
        "VISIT_UPDATED_SUCCESS",
        200,
        updated
      );
    } catch (error) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {
          message: error.message,
        }
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete("/delete/:id")
  async delete(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schemaName = req.user.schemaName;
      const deleted = await this.visitService.delete(id, schemaName);
      return commonResponse.success("en", res, "VISIT_DETAILS", 200, deleted);
    } catch (error) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {
          message: error.message,
        }
      );
    }
  }
}
