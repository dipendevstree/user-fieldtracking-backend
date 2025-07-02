import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { CreatePermissionDto } from "./dtos/create-permission.dto";
import { UpdatePermissionDto } from "./dtos/update-permission.dto";
import { commonResponse } from "helper";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiTags, ApiQuery } from "@nestjs/swagger";
import { RolesGuard } from "../auth/role-auth-guard";
import { CreateMultiplePermissionsDto } from "./dtos/create-multiple-permissions.dto";

@Controller("permission")
@ApiBearerAuth()
@ApiTags("Permission")
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async create(
    @Body() dto: CreatePermissionDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schema = req.user.schemaName;
      dto["organizationId"] = req.user.organizationID;
      const data = await this.permissionService.createPermission(dto, schema);
      return commonResponse.success("en", res, "PERMISSION_CREATED", 201, data);
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
  @Post("/create-multiple")
  async createMultiple(
    @Body() dto: CreateMultiplePermissionsDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const schema = req.user.schemaName;
      const organizationId = req.user.organizationID;
      const permissionsWithOrg = dto.permissions.map((perm) => ({
        ...perm,
        organizationId,
        createdBy: req.user.id,
      }));
      const data = await this.permissionService.createMultiplePermissions(
        permissionsWithOrg,
        schema
      );
      return commonResponse.success(
        "en",
        res,
        "PERMISSIONS_CREATED",
        201,
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
  @Get("/list")
  @ApiQuery({ name: "sort", required: false })
  @ApiQuery({ name: "limit", required: false })
  @ApiQuery({ name: "page", required: false })
  async list(@Req() req: Request, @Res() res: Response) {
    try {
      let schema = req.user.schemaName;
      req.query["organizationId"] = req.user.organizationID;
      req.query["roleId"] = req.user.roleId;
      const data = await this.permissionService.getPermissions(
        req.query,
        schema
      );
      return commonResponse.success("en", res, "PERMISSION_LIST", 200, data);
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
  async detail(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schema = req.user.schemaName;
      const data = await this.permissionService.getPermissionById(id, schema);
      return commonResponse.success("en", res, "PERMISSION_DETAIL", 200, data);
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
    @Body() dto: UpdatePermissionDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schema = req.user.schemaName;
      const data = await this.permissionService.updatePermission(
        id,
        dto,
        schema
      );
      return commonResponse.success("en", res, "PERMISSION_UPDATED", 200, data);
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
      await this.permissionService.deletePermission(id, schema);
      return commonResponse.success("en", res, "PERMISSION_DELETED", 200, {});
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
