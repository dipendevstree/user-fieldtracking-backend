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
import { CustomerService } from "./customer.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/role-auth-guard";
import { commonResponse } from "helper";
import { CreateCustomerDto } from "./dtos/create-customer.dto";
import { UpdateCustomerDto } from "./dtos/update-customer.dto";
import { CustomerContactService } from "../customerContact/customerContact.service";

@Controller("customer")
@ApiBearerAuth()
@ApiTags("Customer")
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly customerContactService: CustomerContactService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async create(
    @Body() createDto: CreateCustomerDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schema = req.user.schemaName;
      createDto["createdBy"] = req?.user?.id;
      createDto["organizationId"] = req.user.organizationID;

      let checkExist = await this.customerService.isExist(
        {
          companyName: createDto.companyName,
          organizationId: req.user.organizationID,
        },
        schema
      );
      if (checkExist) {
        return commonResponse.error("en", res, "CUSTOMER_EXIST", 409, {});
      }
      const result = await this.customerService.create(createDto, schema);
      if (result?.customerId && createDto?.customerContacts?.length) {
        for (const singleCustomerData of createDto.customerContacts) {
          const checkCustomerExits = await this.customerContactService.isExist(
            {
              email: singleCustomerData.email,
              customerId: result.customerId,
            },
            schema
          );

          if (!checkCustomerExits) {
            singleCustomerData["createdBy"] = req?.user?.id;
            singleCustomerData["organizationID"] = req?.user?.organizationID;
            singleCustomerData["customerId"] = result.customerId;

            await this.customerContactService.create(
              singleCustomerData,
              schema
            );
          }
        }
      }

      return commonResponse.success(
        "en",
        res,
        "CUSTOMER_CREATED_SUCCESS",
        201,
        result
      );
    } catch (error) {
      console.log("create error", error);
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
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "sort", required: false })
  async list(@Req() req: Request, @Res() res: Response) {
    try {
      let schema = req.user.schemaName;
      req.query["organizationId"] = req.user.organizationID;
      const data = await this.customerService.getAll(req.query, schema);
      return commonResponse.success(
        "en",
        res,
        "CUSTOMER_LIST_SUCCESS",
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
      const schema = req.user.schemaName;
      const data = await this.customerService.getById(id, schema);
      if (data) {
        return commonResponse.success("en", res, "CUSTOMER_DETAILS", 200, data);
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
    @Body() dto: UpdateCustomerDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schema = req.user.schemaName;
      const record = await this.customerService.getById(id, schema);
      if (record) {
        dto["updatedBy"] = req?.user?.id;
        Object.assign(record, dto);
        const updated = await this.customerService.update(record, schema);
        return commonResponse.success(
          "en",
          res,
          "CUSTOMER_UPDATED_SUCCESS",
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
      const schema = req.user.schemaName;
      const deleted = await this.customerService.delete(id, schema);
      if (deleted) {
        return commonResponse.success(
          "en",
          res,
          "CUSTOMER_DELETED_SUCCESS",
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
