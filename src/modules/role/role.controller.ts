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
import { RoleService } from "./role.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/role-auth-guard";
import { commonResponse } from "helper";
import { CreateRoleDto } from "./dtos/create-role.dto";
import { UpdateRoleDto } from "./dtos/update-role.dto";
import { OrganizationMenuService } from "../organizationMenu/organizationMenu.service";
import { PermissionService } from "../permission/permission.service";

@Controller("role")
@ApiBearerAuth()
@ApiTags("Role")
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly organizationMenuService: OrganizationMenuService,
    private readonly permissionService: PermissionService
  ) {}

  async assignPermissionsToRole(
    menuIds: any,
    roleId: string,
    schemaName: string,
    userId: string,
    organizationId: string
  ) {
    for (const menuItem of menuIds) {
      if (!menuItem) continue;
      const { id, add, viewOwn, viewGlobal, edit, deleteValue, permissionId } =
        menuItem;
      if (permissionId) {
        await this.permissionService.updatePermission(
          permissionId,
          {
            roleId,
            add,
            viewOwn,
            viewGlobal,
            edit,
            delete: deleteValue,
            updatedBy: userId,
          },
          schemaName
        );
      } else {
        const organizationMenu = await this.organizationMenuService.getById(
          id,
          schemaName
        );
        if (organizationMenu) {
          await this.permissionService.createPermission(
            {
              organizationMenuId: organizationMenu.organizationMenuId,
              roleId,
              organizationId,
              add,
              viewOwn,
              viewGlobal,
              edit,
              delete: deleteValue,
              createdBy: userId,
            },
            schemaName
          );
        }
      }
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async createRole(
    @Body() createRoleDto: CreateRoleDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schemaName = req.user.schemaName;
      let checkExist = await this.roleService.isExist(
        {
          roleName: createRoleDto.roleName,
          organizationID: req.user.organizationID,
        },
        schemaName
      );
      if (checkExist) {
        return commonResponse.error("en", res, "ROLE_EXIST", 409, {});
      }
      createRoleDto["createdBy"] = req?.user?.id;
      createRoleDto["organizationID"] = req?.user?.organizationID;
      createRoleDto["isActive"] = true;
      const role = await this.roleService.create(createRoleDto, schemaName);
      if (role) {
        this.assignPermissionsToRole(
          createRoleDto?.menuIds,
          role?.roleId,
          req?.user?.schemaName,
          req?.user?.id,
          req?.user?.organizationID
        );
        return commonResponse.success(
          "en",
          res,
          "ROLE_CREATED_SUCCESS",
          200,
          role
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
  async getAllRole(@Req() req: Request, @Res() res: Response) {
    try {
      let schemaName = req.user.schemaName;
      req.query["organizationId"] = req.user.organizationID;
      const users = await this.roleService.getRole(req.query, schemaName);
      if (users) {
        return commonResponse.success(
          "en",
          res,
          "ROLE_LIST_SUCCESS",
          200,
          users
        );
      } else {
        return commonResponse.error("en", res, "DATA_NOT_FOUND", 404, {});
      }
    } catch (error) {
      console.log("errorerrorerrorerror", error);
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
  async getRoleById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const role = await this.roleService.getRoleById(id);
      if (role) {
        return commonResponse.success("en", res, "ROLE_DETAILS", 200, role);
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
    @Body() UpdateRoleDto: UpdateRoleDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const role = await this.roleService.getRoleById(id);
      if (role) {
        UpdateRoleDto["updatedBy"] = req?.user?.id;
        Object.assign(role, UpdateRoleDto);
        const updatedUser = await this.roleService.update(role);
        this.assignPermissionsToRole(
          UpdateRoleDto?.menuIds,
          id,
          req?.user?.schemaName,
          req?.user?.id,
          req?.user?.organizationID
        );
        return commonResponse.success(
          "en",
          res,
          "ROLE_UPDATED_SUCCESS",
          200,
          updatedUser
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
      const user = await this.roleService.delete(id);
      if (user) {
        return commonResponse.success(
          "en",
          res,
          "ROLE_DELETED_SUCCESS",
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
