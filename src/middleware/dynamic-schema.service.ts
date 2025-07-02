import { Customer } from "src/modules/customer/customer.entity";
import { CustomerContact } from "src/modules/customerContact/customerContact.entity";
import { CustomerType } from "src/modules/customerType/customerType.entity";
import { Department } from "src/modules/department/department.entity";
import { EmployeeRang } from "src/modules/employeeRang/employeeRang.entity";
import { Industry } from "src/modules/industry/industry.entity";
import { LiveTracking } from "src/modules/liveTracking/liveTracking.entity";
import { Menu } from "src/modules/menu/menu.entity";
import { Organization } from "src/modules/organization/organization.entity";
import { OrganizationMenu } from "src/modules/organizationMenu/organizationMenu.entity";
import { OrganizationType } from "src/modules/organizationType/organizationType.entity";
import { Permission } from "src/modules/permission/permission.entity";
import { Role } from "src/modules/role/role.entity";
import { SuperAdmin } from "src/modules/superAdmin/superAdmin.entity";
import { User } from "src/modules/users/user.entity";
import { UserTerritory } from "src/modules/userTerritory/userTerritory.entity";
import { Visit } from "src/modules/visit/visit.entity";
import { WorkBreakSession } from "src/modules/workBreakSession/workBreakSession.entity";
import { WorkDaySession } from "src/modules/workDaySession/workDaySession.entity";
import { DataSource, QueryRunner, Repository } from "typeorm";

// Create this only once or share this from your main DB config

const dataSources: Map<string, DataSource> = new Map();
export async function getRepositoryForCompany<T>(
  entity: any,
  schema: string
): Promise<{
  repo: Repository<T>;
  dataSource: DataSource;
  queryRunner?: QueryRunner;
}> {
  const schemaName = schema;
  let dataSource = dataSources.get(schema);

  if (!dataSource) {
    dataSource = new DataSource({
      type: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT ?? "5432"),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: schemaName, // 👈 default search_path
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
      synchronize: false,
      logging: false,
    });

    try {
      await dataSource.initialize();
      dataSources.set(schema, dataSource);
    } catch (err) {
      console.error(
        `❌ Failed to initialize datasource for schema: ${schemaName}`,
        err
      );
      throw err;
    }
  }

  // Reuse existing initialized datasource — fast and clean
  const repo = dataSource.getRepository<T>(entity);
  return { repo, dataSource };
}
