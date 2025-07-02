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
import { IndustryService } from "./industry.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/role-auth-guard";
import { commonResponse } from "helper";
import { CreateIndustryDto } from "./dtos/create-industry.dto";
import { UpdateIndustryDto } from "./dtos/update-industry.dto";

@Controller("industry")
@ApiBearerAuth()
@ApiTags("Industry")
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("/create")
  async createUser(
    @Body() createIndustryDto: CreateIndustryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let checkExist = await this.industryService.isExist({
        industryName: createIndustryDto.industryName,
      });
      if (checkExist) {
        return commonResponse.error("en", res, "INDUSTRY_EXIST", 409, {});
      }
      createIndustryDto["createdBy"] = req?.user?.id;
      const industry = await this.industryService.create(
        createIndustryDto,
        "public"
      );
      if (industry) {
        return commonResponse.success(
          "en",
          res,
          "INDUSTRY_CREATED_SUCCESS",
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
      const users = await this.industryService.getIndustry(req.query);
      if (users) {
        return commonResponse.success(
          "en",
          res,
          "INDUSTRY_LIST_SUCCESS",
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(":id")
  async getEmployeeRangeById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const industry = await this.industryService.getIndustryById(id);
      if (industry) {
        return commonResponse.success(
          "en",
          res,
          "INDUSTRY_DETAILS",
          200,
          industry
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
    @Body() updateIndustrygDto: UpdateIndustryDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const industry = await this.industryService.getIndustryById(id);
      if (industry) {
        updateIndustrygDto["updatedBy"] = req?.user?.id;
        Object.assign(industry, updateIndustrygDto);
        const updatedUser = await this.industryService.update(industry);
        return commonResponse.success(
          "en",
          res,
          "INDUSTRY_UPDATED_SUCCESS",
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
      const user = await this.industryService.deleteIndustry(id);
      if (user) {
        return commonResponse.success(
          "en",
          res,
          "INDUSTRY_DELETED_SUCCESS",
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
