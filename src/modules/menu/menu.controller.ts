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
import { MenuService } from "./menu.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/role-auth-guard";
import { commonResponse } from "helper";
import { CreateMenuDto } from "./dtos/create-menu.dto";
import { UpdateMenuDto } from "./dtos/update-menu.dto";

@Controller("menu")
@ApiBearerAuth()
@ApiTags("Menu")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async createUser(
    @Body() createMenuDto: CreateMenuDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let checkExist = await this.menuService.isExist({
        menuName: createMenuDto.menuName,
      });
      if (checkExist) {
        return commonResponse.error("en", res, "MENU_EXIST", 409, {});
      }
      createMenuDto["createdBy"] = req?.user?.id;
      const industry = await this.menuService.create(createMenuDto, "public");
      if (industry) {
        return commonResponse.success(
          "en",
          res,
          "MENU_CREATED_SUCCESS",
          200,
          industry
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
  async getAllIndustry(@Req() req: Request, @Res() res: Response) {
    try {
      const users = await this.menuService.getMenu(req.query);
      if (users) {
        return commonResponse.success(
          "en",
          res,
          "MENU_LIST_SUCCESS",
          200,
          users
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
  @Get(":id")
  async getEmployeeRangeById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const industry = await this.menuService.getMenuById(id);
      if (industry) {
        return commonResponse.success("en", res, "MENU_DETAILS", 200, industry);
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
    @Body() updateMenugDto: UpdateMenuDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const industry = await this.menuService.getMenuById(id);
      if (industry) {
        updateMenugDto["updatedBy"] = req?.user?.id;
        Object.assign(industry, updateMenugDto);
        const updatedUser = await this.menuService.update(industry);
        return commonResponse.success(
          "en",
          res,
          "MENU_UPDATED_SUCCESS",
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
      const user = await this.menuService.deleteMenu(id);
      if (user) {
        return commonResponse.success(
          "en",
          res,
          "MENU_DELETED_SUCCESS",
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
