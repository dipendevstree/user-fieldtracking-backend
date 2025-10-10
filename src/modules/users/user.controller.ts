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
import { UsersService } from "./user.service";
import { Request, Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../auth/role-auth-guard";
import { commonResponse, commonFunctions } from "helper";
import { CreateUserDto } from "../users/dtos/create-users.dto";
import { UpdateUserDto } from "../users/dtos/update-users.dto";
import { USER_STATUS } from "helper/constants";
import { MailerService } from "@nestjs-modules/mailer";
// import { OrganizationService } from "../organization/organization.service";
@Controller("users")
@ApiBearerAuth()
@ApiTags("Users")
export class UsersController {
  constructor(
    // private readonly usersService: UsersService,
    // private readonly mailerService: MailerService,
    // private readonly organizationService: OrganizationService
  ) {}

  // async sendAdminEmail(adminData, password) {
  //   let { firstName, lastName, email, phoneNumber, isWebUser, organizationID } =
  //     adminData;
  //   let organization =
  //     await this.organizationService.getOrganizationById(organizationID);
  //   let loginUrl = isWebUser
  //     ? `${process.env.REDIRECT_URL}sign-in`
  //     : `${process.env.MOBILE_APP}`;
  //   let data = {
  //     firstName,
  //     lastName,
  //     organizationName: organization?.organizationName,
  //     userEmail: email,
  //     userPassword: password,
  //     phoneNumber,
  //     loginUrl: loginUrl,
  //     isWebUser,
  //   };
  //   this.mailerService.sendMail({
  //     to: adminData.email,
  //     subject: "Welcome to FieldTrack - Your Account is Ready!",
  //     template: "./user-login-template",
  //     context: data,
  //   });
  // }

  // @Post("/create")
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async createUser(
  //   @Body() createUserDto: CreateUserDto,
  //   @Req() req: Request,
  //   @Res() res: Response
  // ) {
  //   try {
  //     let schemaName = req.user.schemaName;
  //     let checkEmailExist = await this.usersService.isExist(
  //       {
  //         email: createUserDto.email,
  //       },
  //       schemaName
  //     );
  //     if (checkEmailExist) {
  //       return commonResponse.error("en", res, "USER_EMAIL_EXIST", 409, {});
  //     }

  //     let checkPhoneExist = await this.usersService.isExist(
  //       {
  //         phoneNumber: createUserDto.phoneNumber,
  //       },
  //       schemaName
  //     );
  //     if (checkPhoneExist) {
  //       return commonResponse.error(
  //         "en",
  //         res,
  //         "USER_PHONE_NUMBER_EXIST",
  //         409,
  //         {}
  //       );
  //     }
  //     createUserDto["createdBy"] = req.user.id;
  //     createUserDto["organizationID"] = req.user.organizationID;
  //     createUserDto["schemaName"] = req.user.schemaName;
  //     createUserDto["status"] = USER_STATUS.VERIFIED;
  //     let password = commonFunctions?.randomSixDigit();
  //     if (createUserDto.isWebUser) {
  //       createUserDto["password"] = password;
  //     }
  //     const userCreated = await this.usersService.createUser(
  //       createUserDto,
  //       schemaName
  //     );
  //     if (userCreated) {
  //       // this.sendAdminEmail(userCreated, password);
  //       return commonResponse.success(
  //         "en",
  //         res,
  //         "USER_CREATED_SUCCESS",
  //         200,
  //         userCreated
  //       );
  //     } else {
  //       return commonResponse.error("en", res, "DEFAULTER", 200, {});
  //     }
  //   } catch (error) {
  //     console.log("createUserError", error);
  //     return commonResponse.error(
  //       "en",
  //       res,
  //       "DEFAULT_INTERNAL_SERVER_ERROR",
  //       500,
  //       {}
  //     );
  //   }
  // }

  // @Get("/all")
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @ApiQuery({
  //   name: "sort",
  //   required: false,
  //   type: String,
  //   example: "asc",
  //   description: "Sort order (asc/desc)",
  // })
  // @ApiQuery({
  //   name: "limit",
  //   required: false,
  //   type: Number,
  //   example: 10,
  //   description: "Limit the number of results",
  // })
  // @ApiQuery({
  //   name: "page",
  //   required: false,
  //   type: Number,
  //   example: 1,
  //   description: "Page number for pagination",
  // })
  // @ApiQuery({
  //   name: "status",
  //   required: false,
  //   type: String,
  //   example: "pending",
  //   description: "Filter by status",
  // })
  // async getAllUsersFromAllSchema(@Req() req: Request, @Res() res: Response) {
  //   try {
  //     const usersResult = await this.usersService.getAllUsersFromAllSchemas(
  //       req.query
  //     );

  //     if (usersResult?.list && usersResult.list) {
  //       return commonResponse.success(
  //         "en",
  //         res,
  //         "USERS_LIST_SUCCESS",
  //         200,
  //         usersResult
  //       );
  //     } else {
  //       return commonResponse.error("en", res, "NO_USERS_FOUND", 404, {});
  //     }
  //   } catch (error) {
  //     console.log("getAllUsersFromAllSchemasError", error);
  //     return commonResponse.error(
  //       "en",
  //       res,
  //       "DEFAULT_INTERNAL_SERVER_ERROR",
  //       500,
  //       { message: error.message }
  //     );
  //   }
  // }

  // @Get("/list")
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @ApiQuery({
  //   name: "sort",
  //   required: false,
  //   type: String,
  //   example: "asc",
  //   description: "Sort order (asc/desc)",
  // })
  // @ApiQuery({
  //   name: "limit",
  //   required: false,
  //   type: Number,
  //   example: 10,
  //   description: "Limit the number of results",
  // })
  // @ApiQuery({
  //   name: "page",
  //   required: false,
  //   type: Number,
  //   example: 1,
  //   description: "Page number for pagination",
  // })
  // @ApiQuery({
  //   name: "roleId",
  //   required: false,
  //   type: String,
  //   example: "4639d9e9-711d-4e27-99dd-cc6d3e98c82f",
  //   description: "Filter by role id",
  // })
  // @ApiQuery({
  //   name: "territoryId",
  //   required: false,
  //   type: String,
  //   example: "4639d9e9-711d-4e27-99dd-cc6d3e98c82f",
  //   description: "Filter by territory id",
  // })
  // async getAllUsers(@Req() req: Request, @Res() res: Response) {
  //   try {
  //     let schemaName = req.user.schemaName;
  //     req.query["organizationId"] = req.user.organizationID;
  //     const users = await this.usersService.getUsers(req.query, schemaName);
  //     if (users) {
  //       return commonResponse.success(
  //         "en",
  //         res,
  //         "USERS_LIST_SUCCESS",
  //         200,
  //         users
  //       );
  //     } else {
  //       return commonResponse.error("en", res, "NO_USERS_FOUND", 404, {});
  //     }
  //   } catch (error) {
  //     return commonResponse.error(
  //       "en",
  //       res,
  //       "DEFAULT_INTERNAL_SERVER_ERROR",
  //       500,
  //       { message: error.message }
  //     );
  //   }
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get(":id")
  // async getUserById(
  //   @Param("id") id: string,
  //   @Req() req: Request,
  //   @Res() res: Response
  // ) {
  //   try {
  //     let schemaName = req.user.schemaName;
  //     const user = await this.usersService.findById(id, schemaName);
  //     if (user) {
  //       return commonResponse.success("en", res, "USER_DETAILS", 200, user);
  //     } else {
  //       return commonResponse.error("en", res, "NO_USERS_FOUND", 404, {});
  //     }
  //   } catch (error) {
  //     return commonResponse.error(
  //       "en",
  //       res,
  //       "DEFAULT_INTERNAL_SERVER_ERROR",
  //       500,
  //       { message: error.message }
  //     );
  //   }
  // }
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Get("downline/ids")
  // async getDownlineUserIds(@Req() req: Request, @Res() res: Response) {
  //   try {
  //     const loggedInUserId = req.user.id;
  //     const schemaName = req.user.schemaName;

  //     const ids = await this.usersService.getDownlineUserIds(
  //       loggedInUserId,
  //       schemaName
  //     );

  //     return commonResponse.success(
  //       "en",
  //       res,
  //       "DOWNLINE_USERS_FETCHED",
  //       200,
  //       ids
  //     );
  //   } catch (error) {
  //     return commonResponse.error(
  //       "en",
  //       res,
  //       "DEFAULT_INTERNAL_SERVER_ERROR",
  //       500,
  //       {
  //         message: error.message,
  //       }
  //     );
  //   }
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Patch("patch/:id")
  // async updateUser(
  //   @Param("id") id: string,
  //   @Body() updateUserDto: UpdateUserDto,
  //   @Req() req: Request,
  //   @Res() res: Response
  // ) {
  //   try {
  //     let schemaName = req.user.schemaName;

  //     const updatedUser = await this.usersService.updateUser(
  //       id,
  //       updateUserDto,
  //       schemaName
  //     );
  //     return commonResponse.success(
  //       "en",
  //       res,
  //       "USER_UPDATED_SUCCESS",
  //       200,
  //       updatedUser
  //     );
  //   } catch (error) {
  //     return commonResponse.error(
  //       "en",
  //       res,
  //       "DEFAULT_INTERNAL_SERVER_ERROR",
  //       500,
  //       { message: error.message }
  //     );
  //   }
  // }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Delete("delete/:id")
  // async deleteUser(
  //   @Param("id") id: string,
  //   @Req() req: Request,
  //   @Res() res: Response
  // ) {
  //   try {
  //     let schemaName = req.user.schemaName;
  //     const user = await this.usersService.deleteUser(id, schemaName);
  //     if (user) {
  //       return commonResponse.success(
  //         "en",
  //         res,
  //         "USER_DELETED_SUCCESS",
  //         200,
  //         {}
  //       );
  //     } else {
  //       return commonResponse.error("en", res, "NO_USERS_FOUND", 404, {});
  //     }
  //   } catch (error) {
  //     return commonResponse.error(
  //       "en",
  //       res,
  //       "DEFAULT_INTERNAL_SERVER_ERROR",
  //       500,
  //       { message: error.message }
  //     );
  //   }
  // }
}
