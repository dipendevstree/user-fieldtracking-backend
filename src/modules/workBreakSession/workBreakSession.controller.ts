import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { WorkBreakSessionService } from "./workBreakSession.service";
import { CreateWorkBreakSessionDto } from "./dtos/create-workBreakSession.dto";
import { UpdateWorkBreakSessionDto } from "./dtos/update-workBreakSession.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { commonResponse } from "helper";
import { WORK_STATUS } from "helper/constants";
import { EndWorkBreakSessionDto } from "./dtos/end-workBreakSession.dto";

@Controller("workBreakSession")
@ApiBearerAuth()
@ApiTags("WorkBreakSession")
export class WorkBreakSessionController {
  constructor(private readonly service: WorkBreakSessionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("start")
  async workSessionBreakStart(
    @Body() dto: CreateWorkBreakSessionDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schemaName = req.user.schemaName;
      dto["createdBy"] = req.user.id;
      dto["userId"] = req.user.id;
      dto["organizationId"] = req.user.organizationID;
      dto["breakStartTime"] = new Date().toISOString();
      dto["status"] = WORK_STATUS.IN_PROGRESS;
      const result = await this.service.create(dto, schemaName);
      return commonResponse.success(
        "en",
        res,
        "WORK_BREAK_SESSION_CREATED",
        201,
        result
      );
    } catch (error) {
      return commonResponse.error("en", res, "SERVER_ERROR", 500, {
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("end")
  async workSessionBreakEnd(
    @Body() dto: EndWorkBreakSessionDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schemaName = req.user.schemaName;
      dto["updatedBy"] = req.user.id;
      dto["status"] = WORK_STATUS.COMPLETED;
      dto["breakEndTime"] = new Date().toISOString();
      const result = await this.service.update(
        dto.workBreakSessionId,
        dto,
        schemaName
      );
      return commonResponse.success(
        "en",
        res,
        "WORK_BREAK_SESSION_CREATED",
        201,
        result
      );
    } catch (error) {
      return commonResponse.error("en", res, "SERVER_ERROR", 500, {
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("list")
  @ApiQuery({
    name: "date",
    type: String,
    example: "2025-01-31",
    required: false,
  })
  async list(@Req() req: Request, @Res() res: Response) {
    try {
      const schemaName = req.user.schemaName;
      req.query.organizationId = req.user.organizationID;
      req.query.userId = req.user.id;
      req.query["timeZone"] = req.user.timeZone;
      const result = await this.service.getAll(req.query, schemaName);
      return commonResponse.success(
        "en",
        res,
        "WORK_BREAK_SESSION_LIST_SUCCESS",
        200,
        result
      );
    } catch (error) {
      return commonResponse.error("en", res, "SERVER_ERROR", 500, {
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(":id")
  async getById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schemaName = req.user.schemaName;
      const result = await this.service.getById(id, schemaName);
      return commonResponse.success(
        "en",
        res,
        "WORK_BREAK_SESSION_DETAIL",
        200,
        result
      );
    } catch (error) {
      return commonResponse.error("en", res, "SERVER_ERROR", 500, {
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("patch/:id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateWorkBreakSessionDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schemaName = req.user.schemaName;
      dto["updatedBy"] = req.user.id;
      const updated = await this.service.update(req.user.id, dto, schemaName);
      return commonResponse.success(
        "en",
        res,
        "WORK_BREAK_SESSION_UPDATED",
        200,
        updated
      );
    } catch (error) {
      return commonResponse.error("en", res, "SERVER_ERROR", 500, {
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete("delete/:id")
  async delete(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schemaName = req.user.schemaName;
      await this.service.delete(id, schemaName);
      return commonResponse.success(
        "en",
        res,
        "WORK_BREAK_SESSION_DELETED",
        200,
        {}
      );
    } catch (error) {
      return commonResponse.error("en", res, "SERVER_ERROR", 500, {
        message: error.message,
      });
    }
  }
}
