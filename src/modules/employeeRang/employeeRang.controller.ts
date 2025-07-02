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
import { EmployeeRangService } from "./employeeRang.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/role-auth-guard";
import { commonResponse } from "helper";
import { CreateEmployeeRangDto } from "./dtos/create-employeeRang.dto";
import { UpdateEmployeeRangDto } from "./dtos/update-employeeRang.dto";

@Controller("employeeRang")
@ApiBearerAuth()
@ApiTags("EmployeeRang")
export class EmployeeRangController {
  constructor(private readonly employeeRangService: EmployeeRangService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async createUser(
    @Body() createSuperAdminDto: CreateEmployeeRangDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let checkExist = await this.employeeRangService.isExist({
        employeeRange: createSuperAdminDto.employeeRange,
      });
      if (checkExist) {
        return commonResponse.error("en", res, "USER_EXIST", 409, {});
      }
      createSuperAdminDto["createdBy"] = req?.user?.id;
      const employeeRangCreated =
        await this.employeeRangService.createEmployeeRang(
          createSuperAdminDto,
          "public"
        );
      if (employeeRangCreated) {
        return commonResponse.success(
          "en",
          res,
          "EMPLOYEERANGE_CREATED_SUCCESS",
          200,
          employeeRangCreated
        );
      } else {
        return commonResponse.error("en", res, "DEFAULTER", 200, {});
      }
    } catch (error) {
      console.log("createSuperAdminError", error);
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {}
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("/list")
  @ApiQuery({
    name: "sort",
    required: false,
    type: String,
    example: "asc",
    description: "Sort order (asc/desc)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 10,
    description: "Limit the number of results",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1,
    description: "Page number for pagination",
  })
  async getAllEmployeeRange(@Req() req: Request, @Res() res: Response) {
    try {
      const users = await this.employeeRangService.getEmployeeRang(req.query);
      if (users) {
        return commonResponse.success(
          "en",
          res,
          "EMPLOYEERANGE_LIST_SUCCESS",
          200,
          users
        );
      } else {
        return commonResponse.error("en", res, "NO_USERS_FOUND", 404, {});
      }
    } catch (error) {
      console.log("getAllUsersError", error);
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {}
      );
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(":id")
  async getEmployeeRangeById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const user = await this.employeeRangService.getEmployeeRangById(id);
      if (user) {
        return commonResponse.success(
          "en",
          res,
          "EMPLOYEERANGE_DETAILS",
          200,
          user
        );
      } else {
        return commonResponse.error("en", res, "NO_USERS_FOUND", 404, {});
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
  async updateUser(
    @Param("id") id: string,
    @Body() updateSuperAdminDto: UpdateEmployeeRangDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const user = await this.employeeRangService.getEmployeeRangById(id);
      if (user) {
        Object.assign(user, updateSuperAdminDto);
        updateSuperAdminDto["updatedBy"] = req?.user?.id;
        const updatedUser = await this.employeeRangService.update(user);
        return commonResponse.success(
          "en",
          res,
          "EMPLOYEERANGE_UPDATED_SUCCESS",
          200,
          updatedUser
        );
      } else {
        return commonResponse.error("en", res, "NO_USERS_FOUND", 404, {});
      }
    } catch (error) {
      console.log("updateUserError", error);
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {}
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
      const user = await this.employeeRangService.delete(id);
      if (user) {
        return commonResponse.success(
          "en",
          res,
          "EMPLOYEERANGE_DELETED_SUCCESS",
          200,
          {}
        );
      } else {
        return commonResponse.error("en", res, "NO_USERS_FOUND", 404, {});
      }
    } catch (error) {
      console.log("deleteUserError", error);
      return commonResponse.error(
        "en",
        res,
        "DEFAULT_INTERNAL_SERVER_ERROR",
        500,
        {}
      );
    }
  }
}
