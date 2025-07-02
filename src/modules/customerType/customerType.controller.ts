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
import { CustomerTypeService } from "./customerType.service";
import { CreateCustomerTypeDto } from "./dtos/create-customerType.dto";
import { UpdateCustomerTypeDto } from "./dtos/update-customerType.dto";

@Controller("customerType")
@ApiBearerAuth()
@ApiTags("CustomerType")
export class CustomerTypeController {
  constructor(private readonly customerTypeService: CustomerTypeService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async create(
    @Body() dto: CreateCustomerTypeDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schema = req.user.schemaName;
      dto["createdBy"] = req.user.id;
      dto["organizationId"] = req.user.organizationID;
      const exists = await this.customerTypeService.isExist(
        { typeName: dto.typeName, organizationId: req.user.organizationID },
        schema
      );
      if (exists) {
        return commonResponse.error("en", res, "CUSTOMER_TYPE_EXISTS", 409, {});
      }
      const result = await this.customerTypeService.create(dto, schema);
      return commonResponse.success(
        "en",
        res,
        "CUSTOMER_TYPE_CREATED",
        201,
        result
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
  @Get("/list")
  @ApiQuery({ name: "sort", required: false, type: String, example: "asc" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  async list(@Req() req: Request, @Res() res: Response) {
    try {
      let schema = req.user.schemaName;
      req.query["organizationId"] = req.user.organizationID;
      const data = await this.customerTypeService.getAll(req.query, schema);
      return commonResponse.success("en", res, "CUSTOMER_TYPE_LIST", 200, data);
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
      let schema = req.user.schemaName;
      const data = await this.customerTypeService.getById(id, schema);
      return commonResponse.success(
        "en",
        res,
        "CUSTOMER_TYPE_DETAIL",
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
  @Patch("patch/:id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCustomerTypeDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schema = req.user.schemaName;
      const record = await this.customerTypeService.getById(id, schema);
      dto["updatedBy"] = req.user.id;
      Object.assign(record, dto);
      const result = await this.customerTypeService.update(record, schema);
      return commonResponse.success(
        "en",
        res,
        "CUSTOMER_TYPE_UPDATED",
        200,
        result
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
  @Delete("delete/:id")
  async delete(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schema = req.user.schemaName;
      await this.customerTypeService.delete(id, schema);
      return commonResponse.success(
        "en",
        res,
        "CUSTOMER_TYPE_DELETED",
        200,
        {}
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
}
