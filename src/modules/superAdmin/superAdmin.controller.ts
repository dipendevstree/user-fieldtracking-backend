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
} from "@nestjs/common";
import { SuperAdminService } from "./superAdmin.service";
import { Request, Response } from "express";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/decorator/role_decorator";
import { ROLE } from "helper/constants";
import { commonResponse } from "helper";
import { CreateSuperAdminDto } from "./dtos/create-superAdmin.dto";
import { UpdateSuperAdminDto } from "./dtos/update-superAdmin.dto";

@Controller("superAdmin")
@ApiTags("SuperAdmin")
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Post("/create")
  async createUser(
    @Body() createSuperAdminDto: CreateSuperAdminDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let checkExist = await this.superAdminService.isExist({
        userName: createSuperAdminDto.userName,
      });
      if (checkExist) {
        return commonResponse.error("en", res, "USER_EXIST", 409, {});
      }
      const userCreated = await this.superAdminService.createSuperAdmin(
        createSuperAdminDto,
        "public"
      );
      if (userCreated) {
        return commonResponse.success(
          "en",
          res,
          "USER_CREATED_SUCCESS",
          200,
          userCreated
        );
      } else {
        return commonResponse.error("en", res, "DEFAULTER", 200, {});
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
  async getAllUsers(@Req() req: Request, @Res() res: Response) {
    try {
      const users = await this.superAdminService.getSuperAdmin(req.query);
      if (users) {
        return commonResponse.success(
          "en",
          res,
          "USERS_LIST_SUCCESS",
          200,
          users
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

  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN)
  @Get(":id")
  async getUserById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const user = await this.superAdminService.getUserById(id);
      console.log("user", user);
      if (user) {
        return commonResponse.success("en", res, "USER_DETAILS", 200, user);
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

  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN)
  @Patch("patch/:id")
  async updateUser(
    @Param("id") id: string,
    @Body() updateSuperAdminDto: UpdateSuperAdminDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const user = await this.superAdminService.getUserById(id);
      if (user) {
        Object.assign(user, updateSuperAdminDto);
        const updatedUser = await this.superAdminService.update(user);
        return commonResponse.success(
          "en",
          res,
          "USER_UPDATED_SUCCESS",
          200,
          updatedUser
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

  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ROLE.SUPER_ADMIN, ROLE.ADMIN)
  @Delete("delete/:id")
  async deleteUser(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const user = await this.superAdminService.deleteSuperAdmin(id);
      if (user) {
        return commonResponse.success(
          "en",
          res,
          "USER_DELETED_SUCCESS",
          200,
          {}
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
}
