import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { MailerService } from "@nestjs-modules/mailer";
// import { SuperAdminService } from "../superAdmin/superAdmin.service";
import { commonFunctions } from "helper";
import { UsersService } from "../users/user.service";
import { USER_STATUS } from "helper/constants";
@Injectable()
export class AuthService {
  constructor(
    // private readonly superAdminService: SuperAdminService,
    // private readonly jwtService: JwtService,
    // private readonly mailerService: MailerService,
    // private readonly usersService: UsersService
  ) {}

  // async validateSuperAdmin(username: string, password: string): Promise<any> {
  //   const user = await this.superAdminService.getUserByUserName(username);
  //   if (!user) {
  //     return "SuperAdmin_not_found";
  //   }
  //   const isPasswordMatching = await this.comparePassword(
  //     password,
  //     user.password
  //   );
  //   if (!isPasswordMatching) {
  //     return "password_not_match";
  //   }
  //   delete user.password;
  //   return user;
  // }

  // async validateUser(email: string, password: string): Promise<any> {
  //   const user = await this.usersService.findByQuery({ email: email }, [
  //     "organization",
  //     "role",
  //     "role.permissions",
  //     "role.permissions.organizationMenu",
  //   ]);
  //   if (!user) {
  //     return "user_not_found";
  //   }
  //   if (user.status !== USER_STATUS.VERIFIED) {
  //     return "user_not_verified";
  //   }
  //   const isPasswordMatching = await this.comparePassword(
  //     password,
  //     user.password
  //   );
  //   if (!isPasswordMatching) {
  //     return "password_not_match";
  //   }
  //   delete user.password;
  //   return user;
  // }

  // async login(user: any) {
  //   const payload = {
  //     id: user.id,
  //     email: user.email,
  //     roleId: user.roleId,
  //     organizationID: user.organizationID,
  //     schemaName: user.schemaName,
  //     timeZone: user.organization.time_zone,
  //   };
  //   const accessToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_SECRET,
  //     expiresIn: "365d",
  //   });

  //   if (user.role?.permissions) {
  //     user["role"]["permissions"] = commonFunctions.groupPermissionsByModule(
  //       user.role.permissions
  //     );
  //   }
  //   return { ...user, access_token: accessToken, isSuperAdmin: false };
  // }

  // async superAdminLogin(user: any) {
  //   const payload = {
  //     id: user.superAdminId,
  //     userName: user.userName,
  //     role: "superAdmin",
  //   };

  //   const accessToken = this.jwtService.sign(payload, {
  //     secret: process.env.JWT_SECRET,
  //     expiresIn: "365d",
  //   });
  //   return {
  //     ...user,
  //     access_token: accessToken,
  //     isSuperAdmin: true,
  //     name: "sagar",
  //   };
  // }

  // async hashPassword(password: string): Promise<string> {
  //   return bcrypt.hash(password, 10);
  // }

  // async comparePassword(
  //   password: string,
  //   storedPasswordHash: string
  // ): Promise<boolean> {
  //   return bcrypt.compare(password, storedPasswordHash);
  // }

  // async sendResetEmail(email: string, resetUrl: string) {
  //   return await this.mailerService.sendMail({
  //     to: email,
  //     subject: "Password Reset",
  //     template: "./reset-password",
  //     context: { resetUrl },
  //   });
  // }

  // async forgotPassword(email: string) {
  //   const user = await this.usersService.findByQuery({ email: email });
  //   if (!user) {
  //     return "user_not_found";
  //   }
  //   const token = this.jwtService.sign({
  //     email: user.email,
  //     id: user.id,
  //   });
  //   const expirationDate = new Date();
  //   expirationDate.setHours(expirationDate.getHours() + 1);
  //   await this.usersService.storeResetToken(
  //     user,
  //     token,
  //     expirationDate,
  //     user.schemaName
  //   );
  //   const resetUrl = `${process.env.ADMIN_URL}reset-password?token=${token}`;
  //   this.sendResetEmail(email, resetUrl);
  //   return { email, token };
  // }
}
