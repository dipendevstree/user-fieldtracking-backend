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
import { OrganizationService } from "./organization.service";
import { commonResponse, commonFunctions } from "helper";
import { Request, Response } from "express";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { DataSource } from "typeorm";
import { User } from "../users/user.entity";
import { CreateOrgDto } from "./dtos/create-organization.dto";
import { UpdateOrgDto } from "./dtos/update-organization.dto";
import { UsersService } from "../users/user.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/role-auth-guard";
import { RoleService } from "../role/role.service";
import { OrganizationMenuService } from "../organizationMenu/organizationMenu.service";
import { PermissionService } from "../permission/permission.service";
import { MenuService } from "../menu/menu.service";
import { Role } from "../role/role.entity";
import { OrganizationMenu } from "../organizationMenu/organizationMenu.entity";
import { Permission } from "../permission/permission.entity";
import { Menu } from "../menu/menu.entity";
import { Organization } from "./organization.entity";
import { SuperAdmin } from "../superAdmin/superAdmin.entity";
import { EmployeeRang } from "../employeeRang/employeeRang.entity";
import { Industry } from "../industry/industry.entity";
import { MailerService } from "@nestjs-modules/mailer";
import { JwtService } from "@nestjs/jwt";
import { USER_STATUS } from "helper/constants";
import { UserTerritory } from "../userTerritory/userTerritory.entity";
import { CustomerType } from "../customerType/customerType.entity";
import { Customer } from "../customer/customer.entity";
import { CustomerContact } from "../customerContact/customerContact.entity";
import { Department } from "../department/department.entity";
import { OrganizationType } from "../organizationType/organizationType.entity";
import { LiveTracking } from "../liveTracking/liveTracking.entity";
import { Visit } from "../visit/visit.entity";
import { WorkDaySession } from "../workDaySession/workDaySession.entity";
import { WorkBreakSession } from "../workBreakSession/workBreakSession.entity";

@Controller("organization")
@ApiBearerAuth()
@ApiTags("Organization")
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    private readonly roleService: RoleService,
    private readonly organizationMenuService: OrganizationMenuService,
    private readonly permissionService: PermissionService,
    private readonly menuService: MenuService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService
  ) {}

  sendAdminEmail(adminData, OrganizationData, schemaName) {
    let payload = {
      id: adminData.id,
      email: adminData.email,
      role: adminData.role,
      organizationID: adminData.organizationID,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: "30d",
    });
    this.usersService.updateWithPayload(
      adminData.id,
      { active_token: accessToken },
      schemaName
    );
    let activateUrl = `${process.env.REDIRECT_URL}signup?token=${accessToken}`;
    let data = {
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      activateUrl,
      organizationName: OrganizationData.organizationName,
    };
    this.organizationService.updateOrganization(
      OrganizationData.organizationID,
      {
        adminUserId: adminData.id,
      }
    );
    this.mailerService.sendMail({
      to: adminData.email,
      subject: "Activate Account",
      template: "./activate-account",
      context: data,
    });
  }
  nestMenus(menus: any[]) {
    const menuMap = new Map<string, any>();

    for (const menu of menus) {
      menuMap.set(menu.menuId, { ...menu, children: [] });
    }

    const nestedMenus: any[] = [];

    for (const menu of menus) {
      const current = menuMap.get(menu.menuId);
      if (menu.parentMenuId) {
        const parent = menuMap.get(menu.parentMenuId);
        if (parent) {
          parent.children.push(current);
        } else {
          nestedMenus.push(current); // fallback if parent not found
        }
      } else {
        nestedMenus.push(current);
      }
    }

    return nestedMenus;
  }
  async createOrganizationMenusWithPermissions(
    menuIds: string[],
    organizationId: string,
    adminUserId: string,
    adminRoleId: string,
    schemaName: string
  ): Promise<void> {
    // Step 1: Fetch all master menus
    let masterMenus: any[] = [];
    for (const menuId of menuIds || []) {
      const masterMenu = await this.menuService.getMenuById(menuId);
      if (masterMenu) {
        masterMenus.push(masterMenu);
      }
    }

    // Step 2: Nest the master menus
    const nestedMenus = this.nestMenus(masterMenus);

    // Step 3: Recursive menu and permission creation
    const createMenusRecursively = async (
      menus: any[],
      parentOrganizationMenuId: string | null = null
    ) => {
      for (const menu of menus) {
        const createdMenu = await this.organizationMenuService.create(
          {
            menuName: menu.menuName,
            parentMenuId: parentOrganizationMenuId,
            menuKey: menu.menuKey,
            masterMenuId: menu.menuId,
            organizationId,
            createdBy: adminUserId,
            isActive: menu.isActive,
          },
          schemaName
        );

        await this.permissionService.createPermission(
          {
            organizationMenuId: createdMenu.organizationMenuId,
            roleId: adminRoleId,
            organizationId,
            add: true,
            viewOwn: true,
            viewGlobal: true,
            edit: true,
            delete: true,
            createdBy: adminUserId,
          },
          schemaName
        );

        if (menu.children?.length) {
          await createMenusRecursively(
            menu.children,
            createdMenu.organizationMenuId
          );
        }
      }
    };

    await createMenusRecursively(nestedMenus);
  }
  async deleteOrganizationMenusWithPermissions(
    menuIds: string[],
    organizationId: string,

    schemaName: string
  ): Promise<void> {
    for (const menuId of menuIds || []) {
      let getOrgMenu = await this.organizationMenuService.getAll(
        { masterMenuId: menuId, organizationId: organizationId },
        schemaName
      );
      console.log("getOrgMenufafafafa", getOrgMenu);
      if (getOrgMenu?.list?.length) {
        for (const orgMenu of getOrgMenu.list) {
          await this.permissionService.deleteByQuery(
            {
              organizationMenuId: orgMenu.organizationMenuId,
            },
            schemaName
          );
          await this.organizationMenuService.delete(
            orgMenu.organizationMenuId,
            schemaName
          );
        }
      }
    }
  }

  @Post("/create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createOrganization(
    @Body() createOrgDto: CreateOrgDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let schemaName = "public";
      if (createOrgDto?.is_separate_schema) {
        schemaName =
          createOrgDto.organizationName.split(" ")[0].toLowerCase() +
          "_" +
          commonFunctions.randomFourDigits();
      }
      createOrgDto["schema"] = schemaName;
      createOrgDto["createdBy"] = req.user.id;

      // Step 1: Create organization
      let checkExist = await this.organizationService.isExist({
        organizationName: createOrgDto?.organizationName,
      });

      if (checkExist) {
        return commonResponse.error("en", res, "ORGANIZATION_EXISTS", 409, {});
      }
      if (!createOrgDto?.is_separate_schema) {
        let checkEmailIsExist = await this.usersService.isExist(
          {
            email: createOrgDto?.adminEmail,
          },
          schemaName
        );

        if (checkEmailIsExist) {
          return commonResponse.error("en", res, "USER_EMAIL_EXIST", 409, {});
        }
        if (createOrgDto?.adminPhone) {
          let checkPhoneIsExist = await this.usersService.isExist(
            {
              phoneNumber: createOrgDto?.adminPhone,
            },
            schemaName
          );

          if (checkPhoneIsExist) {
            return commonResponse.error(
              "en",
              res,
              "USER_PHONE_NUMBER_EXIST",
              409,
              {}
            );
          }
        }
      }

      const organization: any =
        await this.organizationService.createOrganization(createOrgDto);

      if (createOrgDto?.is_separate_schema) {
        // Step 2: Create schema
        await this.dataSource.query(
          `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`
        );

        // Step 3: Programmatically create tables from Entity in new schema
        const tenantDataSource = new DataSource({
          type: "postgres",
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          schema: schemaName,
          entities: [
            User,
            Organization,
            SuperAdmin,
            EmployeeRang,
            Industry,
            Menu,
            Role,
            OrganizationMenu,
            Department,
            OrganizationType,
            Permission,
            UserTerritory,
            CustomerType,
            Customer,
            CustomerContact,
            LiveTracking,
            Visit,
            WorkDaySession,
            WorkBreakSession,
          ],
          synchronize: true, // automatically creates table from entity
        });
        await tenantDataSource.initialize();
      }

      // Step 4: Create role for the organization
      let adminRole = await this.roleService.create(
        {
          roleName: "admin",
          isActive: true,
          organizationID: organization?.organizationID,
          superAdminCreatedBy: req.user.id,
        },
        schemaName
      );

      // Step 5: Create admin user
      let adminUser = await this.usersService.createUser(
        {
          email: createOrgDto?.adminEmail,
          firstName: createOrgDto?.adminName?.split(" ")[0],
          lastName: createOrgDto?.adminName?.split(" ")[1]
            ? createOrgDto?.adminName?.split(" ")[1]
            : "",
          jobTitle: createOrgDto?.adminJobTitle,
          organizationID: organization?.organizationID,
          phoneNumber: createOrgDto?.adminPhone,
          roleId: adminRole.roleId,
          status: USER_STATUS.CREATED,
          schemaName: schemaName,
          countryCode: createOrgDto.adminPhoneCountryCode,
          superAdminCreatedBy: req.user.id,
        },
        schemaName
      );

      // Step 6: Send Email
      this.sendAdminEmail(adminUser, organization, schemaName);

      // Step 7: Create default menu and permissions.
      this.createOrganizationMenusWithPermissions(
        createOrgDto?.menuIds,
        organization.organizationID,
        adminUser.id,
        adminRole.roleId,
        schemaName
      );

      return commonResponse.success(
        "en",
        res,
        "ORGANIZATION_CREATED",
        201,
        organization
      );
    } catch (error) {
      console.log("error23423242342", error);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
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
  @ApiQuery({
    name: "searchFor",
    required: false,
    type: String,
    description: "Search by name",
  })
  @ApiQuery({
    name: "industryId",
    required: false,
    type: String,
    example: "uuid",
    description: "Filer by industryId",
  })
  @ApiQuery({
    name: "organizationTypeId",
    required: false,
    type: String,
    example: "uuid",
    description: "Filer by organizationTypeId",
  })
  async getOrganization(@Req() req: Request, @Res() res: Response) {
    try {
      const organizations = await this.organizationService.getOrganization(
        req.query
      );

      if (organizations) {
        return commonResponse.success(
          "en",
          res,
          "ORGANIZATION_LIST",
          200,
          organizations
        );
      } else {
        return commonResponse.error("en", res, "NO_COMPANIES_FOUND", 404, {});
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

  @Get("/analytics")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getOrganizationAnalytics(@Req() req: Request, @Res() res: Response) {
    try {
      const analytics =
        await this.organizationService.getOrganizationAnalytics();
      return commonResponse.success(
        "en",
        res,
        "ORGANIZATION_ANALYTICS",
        200,
        analytics
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

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCompanyById(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const company = await this.organizationService.getOrganizationById(id);
      if (company) {
        return commonResponse.success(
          "en",
          res,
          "COMPANY_DETAILS",
          200,
          company
        );
      } else {
        return commonResponse.error("en", res, "COMPANY_NOT_FOUND", 404, {});
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

  @Patch("patch/:id")
  async updateCompany(
    @Param("id") id: string,
    @Body() updateOrgDto: UpdateOrgDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      let organization = await this.organizationService.getOrganizationById(id);
      const oldMenuIds: string[] = organization.menuIds || [];
      const latestMenuIds: string[] = updateOrgDto.menuIds || [];
      const deletedIds = oldMenuIds.filter((id) => !latestMenuIds.includes(id));
      const newIds = latestMenuIds.filter((id) => !oldMenuIds.includes(id));

      let adminUser = await this.usersService.getUserById(
        organization.adminUserId,
        organization.organizationSchema
      );
      if (newIds.length > 0) {
        this.createOrganizationMenusWithPermissions(
          newIds,
          organization.organizationID,
          adminUser.id,
          adminUser.roleId,
          organization.organizationSchema
        );
      }
      if (deletedIds.length > 0) {
        this.deleteOrganizationMenusWithPermissions(
          deletedIds,
          organization.organizationID,
          organization.organizationSchema
        );
      }
      const updatedCompany = await this.organizationService.updateOrganization(
        id,
        updateOrgDto
      );
      if (updatedCompany) {
        return commonResponse.success(
          "en",
          res,
          "COMPANY_UPDATED_SUCCESS",
          200,
          updatedCompany
        );
      } else {
        return commonResponse.error("en", res, "COMPANY_NOT_FOUND", 404, {});
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

  @Delete("delete/:id")
  async deleteCompany(
    @Param("id") id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const deleted = await this.organizationService.deleteOrganization(id);
      if (deleted) {
        return commonResponse.success(
          "en",
          res,
          "COMPANY_DELETED_SUCCESS",
          200,
          {}
        );
      } else {
        return commonResponse.error("en", res, "COMPANY_NOT_FOUND", 404, {});
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
