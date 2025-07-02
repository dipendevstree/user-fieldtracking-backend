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
import { OrganizationTypeService } from "./organizationType.service";
import { CreateOrganizationTypeDto } from "./dtos/create-organizationType.dto";
import { UpdateOrganizationTypeDto } from "./dtos/update-organizationType.dto";

@Controller("organizationtype")
@ApiBearerAuth()
@ApiTags("OrganizationType")
export class OrganizationTypeController {
  constructor(
    private readonly organizationTypeService: OrganizationTypeService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async create(
    @Body() createDto: CreateOrganizationTypeDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const checkExist = await this.organizationTypeService.isExist({
        organizationTypeName: createDto.organizationTypeName,
      });

      if (checkExist) {
        return commonResponse.error(
          "en",
          res,
          "ORGANIZATIONTYPE_EXIST",
          409,
          {}
        );
      }

      createDto["createdBy"] = req?.user?.id;

      const created = await this.organizationTypeService.create(
        createDto,
        "public"
      );

      return commonResponse.success(
        "en",
        res,
        "ORGANIZATIONTYPE_CREATED_SUCCESS",
        200,
        created
      );
    } catch (error) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        { message: error.message }
      );
    }
  }

  @Get("/list")
  @ApiQuery({ name: "sort", required: false, type: String, example: "asc" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  async getAll(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.organizationTypeService.getOrganizationType(
        req.query
      );
      return commonResponse.success(
        "en",
        res,
        "ORGANIZATIONTYPE_LIST_SUCCESS",
        200,
        data
      );
    } catch (error) {
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
  @Get(":id")
  async getById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const data =
        await this.organizationTypeService.getOrganizationTypeById(id);
      if (data) {
        return commonResponse.success(
          "en",
          res,
          "ORGANIZATIONTYPE_DETAILS",
          200,
          data
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
        { message: error.message }
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("patch/:id")
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateOrganizationTypeDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const record =
        await this.organizationTypeService.getOrganizationTypeById(id);
      if (record) {
        updateDto["updatedBy"] = req?.user?.id;
        const updated = await this.organizationTypeService.updateDepartment(
          id,
          updateDto
        );
        return commonResponse.success(
          "en",
          res,
          "ORGANIZATIONTYPE_UPDATED_SUCCESS",
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
        { message: error.message }
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
      const result =
        await this.organizationTypeService.deleteOrganizationType(id);
      if (result) {
        return commonResponse.success(
          "en",
          res,
          "ORGANIZATIONTYPE_DELETED_SUCCESS",
          200,
          {}
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
        { message: error.message }
      );
    }
  }
}
