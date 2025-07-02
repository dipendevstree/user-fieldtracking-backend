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
import { DepartmentService } from "./department.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/role-auth-guard";
import { commonResponse } from "helper";
import { CreateDepartmentDto } from "./dtos/create-department.dto";
import { UpdateDepartmentDto } from "./dtos/update-department.dto";

@Controller("department")
@ApiBearerAuth()
@ApiTags("Department")
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const checkExist = await this.departmentService.isExist({
        departmentName: createDepartmentDto.departmentName,
      });
      if (checkExist) {
        return commonResponse.error("en", res, "DEPARTMENT_EXIST", 409, {});
      }

      createDepartmentDto["createdBy"] = req?.user?.id;

      const department = await this.departmentService.create(
        createDepartmentDto,
        "public"
      );

      if (department) {
        return commonResponse.success(
          "en",
          res,
          "DEPARTMENT_CREATED_SUCCESS",
          200,
          department
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
  async getAll(@Req() req: Request, @Res() res: Response) {
    try {
      const data = await this.departmentService.getDepartment(req.query);
      if (data) {
        return commonResponse.success(
          "en",
          res,
          "DEPARTMENT_LIST_SUCCESS",
          200,
          data
        );
      } else {
        return commonResponse.error("en", res, "NO_DATA_FOUND", 404, {});
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
  async getById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const department = await this.departmentService.getDepartmentById(id);
      if (department) {
        return commonResponse.success(
          "en",
          res,
          "DEPARTMENT_DETAILS",
          200,
          department
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
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const department = await this.departmentService.getDepartmentById(id);
      if (department) {
        updateDepartmentDto["updatedBy"] = req?.user?.id;
        Object.assign(department, updateDepartmentDto);
        const updated = await this.departmentService.update(department);
        return commonResponse.success(
          "en",
          res,
          "DEPARTMENT_UPDATED_SUCCESS",
          200,
          updated
        );
      } else {
        return commonResponse.error("en", res, "DATA_NOT_FOUND", 404, {});
      }
    } catch (error) {
      console.error("Error updating department:", error);
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
      const result = await this.departmentService.deleteDepartment(id);
      if (result) {
        return commonResponse.success(
          "en",
          res,
          "DEPARTMENT_DELETED_SUCCESS",
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
