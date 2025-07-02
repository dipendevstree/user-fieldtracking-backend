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
import { UserTerritoryService } from "./userTerritory.service";
import { CreateUserTerritoryDto } from "./dtos/create-userTerritory.dto";
import { UpdateUserTerritoryDto } from "./dtos/update-userTerritory.dto";

@Controller("userTerritory")
@ApiBearerAuth()
@ApiTags("UserTerritory")
export class UserTerritoryController {
  constructor(private readonly userTerritoryService: UserTerritoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async create(
    @Body() dto: CreateUserTerritoryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schema = req.user.schemaName;
      const exists = await this.userTerritoryService.isExist(
        { name: dto.name, organizationId: req.user.organizationID },
        schema
      );
      if (exists) {
        return commonResponse.error(
          "en",
          res,
          "USER_TERRITORY_EXISTS",
          409,
          {}
        );
      }
      console.log("reqUser132121212121", req.user);
      dto["createdBy"] = req.user.id;
      dto["organizationId"] = req.user.organizationID;
      const result = await this.userTerritoryService.create(dto, schema);
      return commonResponse.success(
        "en",
        res,
        "USER_TERRITORY_CREATED",
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
  @ApiQuery({ name: "sort", required: false, example: "asc" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  async list(@Req() req: Request, @Res() res: Response) {
    try {
      const schema = req.user.schemaName;
      req.query["organizationId"] = req.user.organizationID;
      const data = await this.userTerritoryService.getAll(req.query, schema);
      return commonResponse.success(
        "en",
        res,
        "USER_TERRITORY_LIST",
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(":id")
  async getById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schema = req.user.schemaName;
      const data = await this.userTerritoryService.getById(id, schema);
      return commonResponse.success(
        "en",
        res,
        "USER_TERRITORY_DETAIL",
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("patch/:id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateUserTerritoryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schema = req.user.schemaName;
      const record = await this.userTerritoryService.getById(id, schema);
      if (record) {
        dto["updatedBy"] = req.user.id;
        dto["organizationId"] = req.user.organizationID;
        Object.assign(record, dto);
        const updated = await this.userTerritoryService.update(record, schema);
        return commonResponse.success(
          "en",
          res,
          "USER_TERRITORY_UPDATED",
          200,
          updated
        );
      }
      return commonResponse.error("en", res, "DATA_NOT_FOUND", 404, {});
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
  @Delete("delete/:id")
  async delete(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schema = req.user.schemaName;
      await this.userTerritoryService.delete(id, schema);
      return commonResponse.success(
        "en",
        res,
        "USER_TERRITORY_DELETED",
        200,
        {}
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
