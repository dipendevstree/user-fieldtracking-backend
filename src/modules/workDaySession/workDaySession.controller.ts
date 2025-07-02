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
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { WorkDaySessionService } from "./workDaySession.service";
import { StartWorkDaySessionDto } from "./dtos/start-workDaySession.dto";
import { UpdateWorkDaySessionDto } from "./dtos/update-workDaySession.dto";
import { ApiBearerAuth, ApiTags, ApiQuery } from "@nestjs/swagger";
import { commonResponse } from "helper";
import { WORK_STATUS } from "helper/constants";
import moment from "moment-timezone";
import { EndWorkDaySessionDto } from "./dtos/end-workDaySession.dto";
@Controller("workDaySession")
@ApiBearerAuth()
@ApiTags("WorkDaySession")
export class WorkDaySessionController {
  constructor(private readonly workDaySessionService: WorkDaySessionService) {}

  calculateWorkingHours(data: any, timeZone) {
    let startTimeISO = data.startTime;
    let endTimeISO = data.endTime;
    let breaks = data.breaks;
    const startTime = moment.tz(startTimeISO, timeZone);
    const endTime = endTimeISO
      ? moment.tz(endTimeISO, timeZone)
      : moment.tz(timeZone);

    // Step 1: Total work duration
    const totalDuration = moment.duration(endTime.diff(startTime));

    // Step 2: Break duration
    let totalBreakDuration = moment.duration(0);
    for (const brk of breaks) {
      const breakStart = moment.tz(brk.breakStartTime, timeZone);
      const breakEnd = brk.breakEndTime
        ? moment.tz(brk.breakEndTime, timeZone)
        : endTime;

      if (breakStart.isBefore(endTime)) {
        const actualBreakEnd = breakEnd.isAfter(endTime) ? endTime : breakEnd;
        const breakDuration = moment.duration(actualBreakEnd.diff(breakStart));
        totalBreakDuration.add(breakDuration);
      }
    }

    // ✅ Fix: subtract durations using milliseconds
    const netDuration = moment.duration(
      totalDuration.asMilliseconds() - totalBreakDuration.asMilliseconds()
    );

    // Step 4: Format
    const hours = String(Math.floor(netDuration.asHours())).padStart(2, "0");
    const minutes = String(netDuration.minutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/start")
  async workSessionStart(
    @Body() dto: StartWorkDaySessionDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let date = dto.date;
      let schema = req.user.schemaName;
      dto["createdBy"] = req.user.id;
      dto["userId"] = req.user.id;
      dto["organizationId"] = req.user.organizationID;
      dto["status"] = WORK_STATUS.IN_PROGRESS;
      dto["date"] = moment(dto.date, "DD-MM-YYYY").toISOString();
      dto["startTime"] = new Date().toISOString();

      let existing = await this.workDaySessionService.findByQuery({
        organizationId: req.user.organizationID,
        userId: req.user.id,
        date: moment(date, "YYYY-MM-DD"),
        timeZone: req.user.timeZone,
      });

      if (existing) {
        return commonResponse.error(
          "en",
          res,
          "WORK_DAY_SESSION_ALREADY_EXISTS",
          409
        );
      }
      const result = await this.workDaySessionService.create(dto, schema);
      return commonResponse.success(
        "en",
        res,
        "WORK_DAY_SESSION_CREATED",
        201,
        result
      );
    } catch (error) {
      return commonResponse.error("en", res, "INTERNAL_ERROR", 500, {
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/end")
  async end(
    @Body() dto: EndWorkDaySessionDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schema = req.user.schemaName;
      dto["updatedBy"] = req.user.id;
      dto["status"] = WORK_STATUS.COMPLETED;
      dto["endTime"] = new Date().toISOString();
      const result = await this.workDaySessionService.update(
        dto.workDaySessionId,
        dto,
        schema
      );
      return commonResponse.success(
        "en",
        res,
        "WORK_DAY_SESSION_UPDATED",
        201,
        result
      );
    } catch (error) {
      return commonResponse.error("en", res, "INTERNAL_ERROR", 500, {
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("/getSession")
  @ApiQuery({
    name: "date",
    type: String,
    example: "2025-01-31",
    required: false,
  })
  async getSessionInfo(@Req() req: Request, @Res() res: Response) {
    try {
      let schema = req.user.schemaName;
      req.query.organizationId = req.user.organizationID;
      req.query.userId = req.user.id;
      req.query["timeZone"] = req.user.timeZone;
      const data = await this.workDaySessionService.findByQuery(
        req.query,
        ["breaks"],
        schema
      );
      data["workingHours"] = this.calculateWorkingHours(
        data,
        req.user.timeZone
      );
      return commonResponse.success(
        "en",
        res,
        "WORK_DAY_SESSION_DETAIL",
        200,
        data
      );
    } catch (error) {
      return commonResponse.error("en", res, "INTERNAL_ERROR", 500, {
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("/list")
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  async list(@Req() req: Request, @Res() res: Response) {
    try {
      let schema = req.user.schemaName;
      req.query.organizationId = req.user.organizationID;
      const data = await this.workDaySessionService.getAll(req.query, schema);
      return commonResponse.success(
        "en",
        res,
        "WORK_DAY_SESSION_LIST",
        200,
        data
      );
    } catch (error) {
      return commonResponse.error("en", res, "INTERNAL_ERROR", 500, {
        message: error.message,
      });
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
      let schema = req.user.schemaName;
      const data = await this.workDaySessionService.getById(id, schema);
      return commonResponse.success(
        "en",
        res,
        "WORK_DAY_SESSION_DETAIL",
        200,
        data
      );
    } catch (error) {
      return commonResponse.error("en", res, "INTERNAL_ERROR", 500, {
        message: error.message,
      });
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("/patch/:id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateWorkDaySessionDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schema = req.user.schemaName;
      dto["updatedBy"] = req.user.id;
      const updated = await this.workDaySessionService.update(id, dto, schema);
      return commonResponse.success(
        "en",
        res,
        "WORK_DAY_SESSION_UPDATED",
        200,
        updated
      );
    } catch (error) {
      return commonResponse.error("en", res, "INTERNAL_ERROR", 500, {
        message: error.message,
      });
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
      let schema = req.user.schemaName;
      await this.workDaySessionService.delete(id, schema);
      return commonResponse.success(
        "en",
        res,
        "WORK_DAY_SESSION_DELETED",
        200,
        {}
      );
    } catch (error) {
      return commonResponse.error("en", res, "INTERNAL_ERROR", 500, {
        message: error.message,
      });
    }
  }
}
