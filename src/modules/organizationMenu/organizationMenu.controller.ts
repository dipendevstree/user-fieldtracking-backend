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
import { OrganizationMenuService } from "./organizationMenu.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/role-auth-guard";
import { commonResponse } from "helper";
import { CreateOrganizationMenuDto } from "./dtos/create-organizationMenu.dto";
import { UpdateOrganizationMenuDto } from "./dtos/update-organizationMenu.dto";

@Controller("organizationMenu")
@ApiBearerAuth()
@ApiTags("OrganizationMenu")
export class OrganizationMenuController {
  constructor(
    private readonly organizationMenuService: OrganizationMenuService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async create(
    @Body() createDto: CreateOrganizationMenuDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schemaName = req.user.schemaName;
      const checkExist = await this.organizationMenuService.isExist(
        {
          menuKey: createDto.menuKey,
          organizationId: createDto.organizationId,
        },
        schemaName
      );
      if (checkExist) {
        return commonResponse.error(
          "en",
          res,
          "ORGANIZATION_MENU_EXISTS",
          409,
          {}
        );
      }

      createDto["createdBy"] = req?.user?.id;
      const result = await this.organizationMenuService.create(
        createDto,
        schemaName
      );
      return commonResponse.success(
        "en",
        res,
        "ORGANIZATION_MENU_CREATED",
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
  async list(@Req() req: Request, @Res() res: Response) {
    try {
      let schemaName = req.user.schemaName;
      req.query["organizationId"] = req.user.organizationID;
      const data = await this.organizationMenuService.getAll(
        req.query,
        schemaName
      );
      return commonResponse.success(
        "en",
        res,
        "ORGANIZATION_MENU_LIST",
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
      let schemaName = req.user.schemaName;
      const data = await this.organizationMenuService.getById(id, schemaName);
      if (data) {
        return commonResponse.success(
          "en",
          res,
          "ORGANIZATION_MENU_DETAIL",
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
    @Body() updateDto: UpdateOrganizationMenuDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schemaName = req.user.schemaName;
      const record = await this.organizationMenuService.getById(id, schemaName);
      if (record) {
        updateDto["updatedBy"] = req?.user?.id;
        Object.assign(record, updateDto);
        const updated = await this.organizationMenuService.update(
          record,
          schemaName
        );
        return commonResponse.success(
          "en",
          res,
          "ORGANIZATION_MENU_UPDATED",
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
      let schemaName = req.user.schemaName;
      const deleted = await this.organizationMenuService.delete(id, schemaName);
      if (deleted) {
        return commonResponse.success(
          "en",
          res,
          "ORGANIZATION_MENU_DELETED",
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
