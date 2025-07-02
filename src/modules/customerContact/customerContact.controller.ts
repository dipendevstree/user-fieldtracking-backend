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
import { CustomerContactService } from "./customerContact.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { CreateCustomerContactDto } from "./dtos/create-customerContact.dto";
import { UpdateCustomerContactDto } from "./dtos/update-customerContact.dto";
import { ApiBearerAuth, ApiTags, ApiQuery } from "@nestjs/swagger";
import { commonResponse } from "helper";

@Controller("customerContact")
@ApiBearerAuth()
@ApiTags("CustomerContact")
export class CustomerContactController {
  constructor(private readonly service: CustomerContactService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async create(
    @Body() dto: CreateCustomerContactDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schema = req.user.schemaName;
      dto["createdBy"] = req.user.id;
      dto["organizationID"] = req.user.organizationID;
      const exists = await this.service.isExist(
        { email: dto.email, organizationID: req.user.organizationID },
        schema
      );
      if (exists) {
        return commonResponse.error(
          "en",
          res,
          "CUSTOMER_CONTACT_EXISTS",
          409,
          {}
        );
      }
      const result = await this.service.create(dto, schema);
      return commonResponse.success(
        "en",
        res,
        "CUSTOMER_CONTACT_CREATED",
        201,
        result
      );
    } catch (err) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        { message: err.message }
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("/list")
  @ApiQuery({ name: "page", required: false, example: 1 })
  @ApiQuery({ name: "limit", required: false, example: 10 })
  @ApiQuery({
    name: "customerId",
    required: false,
    type: String,
    example: "uuid",
    description: "Filer by customerId",
  })
  async list(@Req() req: Request, @Res() res: Response) {
    try {
      let schema = req.user.schemaName;
      req.query.organizationID = req.user.organizationID;
      const data = await this.service.getAll(req.query, schema);
      return commonResponse.success(
        "en",
        res,
        "CUSTOMER_CONTACT_LIST",
        200,
        data
      );
    } catch (err) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        { message: err.message }
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
      let schema = req.user.schemaName;
      const data = await this.service.getById(id, schema);
      return commonResponse.success(
        "en",
        res,
        "CUSTOMER_CONTACT_DETAIL",
        200,
        data
      );
    } catch (err) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        { message: err.message }
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch("/patch/:id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCustomerContactDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schema = req.user.schemaName;
      const record = await this.service.getById(id, schema);
      if (!record)
        return commonResponse.error("en", res, "DATA_NOT_FOUND", 404, {});
      dto["updatedBy"] = req.user.id;
      Object.assign(record, dto);
      const updated = await this.service.update(record, schema);
      return commonResponse.success(
        "en",
        res,
        "CUSTOMER_CONTACT_UPDATED",
        200,
        updated
      );
    } catch (err) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        { message: err.message }
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
      let schema = req.user.schemaName;
      await this.service.delete(id, schema);
      return commonResponse.success(
        "en",
        res,
        "CUSTOMER_CONTACT_DELETED",
        200,
        {}
      );
    } catch (err) {
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        { message: err.message }
      );
    }
  }
}
