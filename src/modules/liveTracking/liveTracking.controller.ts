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
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { commonResponse } from "helper";
import { LiveTrackingService } from "./liveTracking.service";
import { CreateLiveTrackingDto } from "./dtos/create-liveTracking.dto";
import { UpdateLiveTrackingDto } from "./dtos/update-liveTracking.dto";
import { string } from "joi";

@Controller("liveTracking")
@ApiBearerAuth()
@ApiTags("LiveTracking")
export class LiveTrackingController {
  constructor(private readonly liveTrackingService: LiveTrackingService) {}

  @Post("/create")
  async create(
    @Body() createDto: CreateLiveTrackingDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schema = "public";
      createDto["createdBy"] = createDto?.userId;
      const isExists = await this.liveTrackingService.isExist(
        {
          lat: createDto.lat,
          long: createDto.long,
          userId: createDto.userId,
        },
        schema
      );
      if (isExists) {
        return commonResponse.error("en", res, "LIVE_TRACKING_EXIST", 409, {});
      }
      const result = await this.liveTrackingService.create(createDto, schema);
      return commonResponse.success(
        "en",
        res,
        "LIVE_TRACKING_CREATED_SUCCESS",
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

  @Get("/list")
  @ApiQuery({ name: "userId", required: false })
  async list(@Req() req: Request, @Res() res: Response) {
    try {
      const schema = "public";
      const data = await this.liveTrackingService.getAllWithQuery(
        req.query,
        schema
      );
      return commonResponse.success(
        "en",
        res,
        "LIVE_TRACKING_LIST_SUCCESS",
        200,
        data
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

  @Get(":id")
  async getById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schema = req.user.schemaName;
      const data = await this.liveTrackingService.getById(id, schema);
      return commonResponse.success(
        "en",
        res,
        "LIVE_TRACKING_DETAIL",
        200,
        data
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

  @Patch("patch/:id")
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateLiveTrackingDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schema = req.user.schemaName;
      const record = await this.liveTrackingService.getById(id, schema);
      if (record) {
        updateDto["updatedBy"] = req.user.id;
        Object.assign(record, updateDto);
        const updated = await this.liveTrackingService.update(record, schema);
        return commonResponse.success(
          "en",
          res,
          "LIVE_TRACKING_UPDATED",
          200,
          updated
        );
      } else {
        return commonResponse.error("en", res, "DATA_NOT_FOUND", 404, {});
      }
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

  @Delete("delete/:id")
  async delete(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schema = req.user.schemaName;
      const deleted = await this.liveTrackingService.delete(id, schema);
      return commonResponse.success(
        "en",
        res,
        "LIVE_TRACKING_DELETED",
        200,
        deleted
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
}
