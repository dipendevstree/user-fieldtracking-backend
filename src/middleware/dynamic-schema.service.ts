import { Organization } from "src/modules/organization/organization.entity";
import { SuperAdmin } from "src/modules/superAdmin/superAdmin.entity";
import { User } from "src/modules/users/user.entity";
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
