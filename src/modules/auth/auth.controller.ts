import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Get,
  Query,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/user.service";
import { LoginDto } from "./dtos/login.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { SignUpDto } from "./dtos/signup.dto";
import { SuperAdminLoginDto } from "./dtos//superAdminLogin.dto";
import { OrganizationService } from "../organization/organization.service";
import { ActiveUserBySuperAdminDto } from "./dtos/activeUserBySuperAdmin.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RolesGuard } from "./role-auth-guard";
import { SendOtpDto } from "./dtos/sendOtp.dto";
import { commonFunctions, commonResponse } from "helper";
import { USER_STATUS } from "helper/constants";
import { AdminLoginDto } from "./dtos/admin-login.dto";
import { ChangePasswordDto } from "./dtos/change-password.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly organizationService: OrganizationService
  ) {}

  @Post("signup")
  @UsePipes(new ValidationPipe({ transform: true }))
  async signup(@Body() signupDto: SignUpDto, @Req() req, @Res() res) {
    try {
      let {
        token,
        email,
        firstName,
        lastName,
        jobTitle,
        phoneNumber,
        orgAddress,
        orgCity,
        orgCountry,
        orgDescription,
        orgState,
        orgWebsite,
        orgZipcode,
        orgTypeId,
        orgName,
        password,
      } = signupDto;
      let query = { active_token: token };
      const user = await this.usersService.findByQuery(query, ["organization"]);
      if (!user) {
        return commonResponse.customResponse(
          "en",
          res,
          "USER_NOT_FOUND",
          400,
          {}
        );
      }

      if (user.email != email) {
        let exitsUser = await this.usersService.findByQuery(
          {
            email: email,
          },
          []
        );
        if (exitsUser) {
          return commonResponse.customResponse(
            "en",
            res,
            "USER_EMAIL_EXIST",
            400,
            {}
          );
        }
      }
      if (phoneNumber != user.phoneNumber) {
        let exitsPhone = await this.usersService.findByQuery(
          {
            phoneNumber: phoneNumber,
          },
          []
        );
        if (exitsPhone) {
          return commonResponse.customResponse(
            "en",
            res,
            "USER_PHONE_NUMBER_EXIST",
            400,
            {}
          );
        }
      }
      let passwordHash = await this.authService.hashPassword(password);
      this.usersService.updateWithPayload(
        user.id,
        {
          email,
          firstName,
          lastName,
          jobTitle,
          phoneNumber,
          password: passwordHash,
          isPasswordChanged: true,
          status: USER_STATUS.PENDING,
        },
        user?.organization?.organizationSchema
      );
      this.organizationService.updateOrganization(
        user?.organization?.organizationID,
        {
          address: orgAddress,
          city: orgCity,
          country: orgCountry,
          description: orgDescription,
          state: orgState,
          website: orgWebsite,
          zipCode: orgZipcode,
          organizationTypeId: orgTypeId,
          organizationName: orgName,
        }
      );
      return commonResponse.success("en", res, "SIGNUP_SUCCESS", 200, user);
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

  @Post("login")
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginDto: LoginDto, @Req() req, @Res() res) {
    try {
      let query = { otp: loginDto.otp };
      const user = await this.usersService.findByQuery(query, [
        "organization",
        "role",
        "role.permissions",
        "role.permissions.organizationMenu",
      ]);
      if (!user) {
        return commonResponse.customResponse("en", res, "OTP_INVALID", 400, {});
      }
      if (user.status !== USER_STATUS.VERIFIED) {
        return commonResponse.customResponse(
          "en",
          res,
          "USER_NOT_VERIFIED",
          400,
          {}
        );
      }
      const response = await this.authService.login(user);
      return commonResponse.success("en", res, "LOGIN_SUCCESS", 200, response);
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

  @Get("getUserByToken")
  async getUserByToken(@Query("token") token: string, @Req() req, @Res() res) {
    try {
      let query = { active_token: token };
      const user = await this.usersService.findByQuery(query, ["organization"]);
      if (!user) {
        return commonResponse.customResponse(
          "en",
          res,
          "USER_NOT_FOUND",
          400,
          {}
        );
      }
      return commonResponse.success("en", res, "USER_DETAILS", 200, user);
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

  @Post("adminLogin")
  @UsePipes(new ValidationPipe({ transform: true }))
  async adminLogin(
    @Body() adminLoginDto: AdminLoginDto,
    @Req() req,
    @Res() res
  ) {
    try {
      const user = await this.authService.validateUser(
        adminLoginDto.email,
        adminLoginDto.password
      );
      if (user === "user_not_verified") {
        return commonResponse.customResponse(
          "en",
          res,
          "USER_NOT_VERIFIED",
          400,
          {}
        );
      }
      if (user === "user_not_found") {
        return commonResponse.error("en", res, "INVALID_EMAIL", 400, {});
      }
      if (user === "password_not_match") {
        return commonResponse.error("en", res, "INVALID_PASSWORD", 400, {});
      }
      const response = await this.authService.login(user);
      return commonResponse.success("en", res, "LOGIN_SUCCESS", 200, response);
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

  @Post("superAdminLogin")
  @UsePipes(new ValidationPipe({ transform: true }))
  async superAdminLogin(
    @Body() superAdminLoginDto: SuperAdminLoginDto,
    @Req() req,
    @Res() res
  ) {
    try {
      const user = await this.authService.validateSuperAdmin(
        superAdminLoginDto.username,
        superAdminLoginDto.password
      );
      if (user === "SuperAdmin_not_found") {
        return commonResponse.error("en", res, "INVALID_EMAIL", 400, {});
      }
      if (user === "password_not_match") {
        return commonResponse.error("en", res, "INVALID_PASSWORD", 400, {});
      }
      const response = await this.authService.superAdminLogin(user);
      return commonResponse.success("en", res, "LOGIN_SUCCESS", 200, response);
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

  @Post("activeDeactivateUserBySuperAdmin")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async activeUserBySuperAdmin(
    @Body() activeUserBySuperAdminDto: ActiveUserBySuperAdminDto,
    @Req() req,
    @Res() res
  ) {
    try {
      let query = { id: activeUserBySuperAdminDto.userId };
      const user = await this.usersService.findByQuery(query, []);
      if (!user) {
        return commonResponse.customResponse(
          "en",
          res,
          "USER_NOT_FOUND",
          400,
          {}
        );
      }
      this.usersService.updateWithPayload(
        user.id,
        { status: activeUserBySuperAdminDto.status },
        user.schemaName
      );
      return commonResponse.success(
        "en",
        res,
        activeUserBySuperAdminDto.status === USER_STATUS.VERIFIED
          ? "USER_ACTIVE"
          : "USER_DEACTIVATED",
        200,
        {}
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

  @Post("sendOtp")
  async sendOtp(@Body() sendOtp: SendOtpDto, @Req() req, @Res() res) {
    try {
      let query = {
        phoneNumber: sendOtp.phoneNumber,
        countryCode: sendOtp.countryCode,
      };
      const user = await this.usersService.findByQuery(query, []);
      if (!user) {
        return commonResponse.customResponse(
          "en",
          res,
          "PHONE_NUMBER_NOT_VALID",
          400,
          {}
        );
      }
      let otp = commonFunctions.randomSixDigit();
      this.usersService.updateWithPayload(
        user.id,
        { otp: otp },
        user?.schemaName
      );
      return commonResponse.success("en", res, "SEND_OTP", 200, {
        otp: otp,
      });
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

  @Post("changePassword")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async changePasswordByUser(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
    @Res() res
  ) {
    try {
      const user = await this.usersService.getUserById(
        req.user.id,
        req.user.schemaName
      );
      if (!user) {
        return commonResponse.customResponse(
          "en",
          res,
          "USER_NOT_FOUND",
          400,
          {}
        );
      }
      await this.usersService.updateUser(
        req.user.id,
        { password: changePasswordDto.new_password },
        req.user.schemaName
      );
      return commonResponse.success("en", res, "PASSWORD_CHANGED", 200, {});
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

  @Post("forgot-password")
  @UsePipes(new ValidationPipe({ transform: true }))
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
    @Req() req,
    @Res() res
  ) {
    try {
      const response = await this.authService.forgotPassword(body.email);
      if (response === "user_not_found") {
        return commonResponse.error("en", res, "INVALID_EMAIL", 400, {});
      }
      return commonResponse.success(
        "en",
        res,
        "FORGOT_PASSWORD_SUCCESS",
        200,
        response
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

  @Post("reset-password")
  @UsePipes(new ValidationPipe({ transform: true }))
  async resetPassword(@Body() body: ResetPasswordDto, @Req() req, @Res() res) {
    try {
      let query = { active_token: body.token };
      const user = await this.usersService.findByQuery(query, []);
      if (!user) {
        return commonResponse.customResponse(
          "en",
          res,
          "USER_NOT_FOUND",
          400,
          {}
        );
      }
      if (user?.resetTokenExpires < new Date()) {
        return commonResponse.customResponse(
          "en",
          res,
          "TOKEN_EXPIRED",
          400,
          {}
        );
      }

      const hashedPassword = await this.authService.hashPassword(
        body.new_password
      );
      user.password = hashedPassword;

      const updatedUser = await this.usersService.update(user, user.schemaName);
      if (updatedUser) {
        await this.usersService.deleteToken(body.token);
        return commonResponse.success(
          "en",
          res,
          "PASSWORD_RESET_SUCCESS",
          200,
          {}
        );
      } else {
        return commonResponse.customResponse(
          "en",
          res,
          "SERVER_ERROR",
          400,
          {}
        );
      }
    } catch (error) {
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
