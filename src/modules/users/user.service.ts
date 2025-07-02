import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./user.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { FindOptionsWhere, In, Repository } from "typeorm";
import { USER_STATUS } from "helper/constants";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  async isExist(query: any, schema: string): Promise<User | undefined> {
    const { repo } = await getRepositoryForCompany<User>(User, schema);
    return await repo.findOne({ where: query });
  }
  async createUser(createUserDto: any, schema: string): Promise<User> {
    const { repo } = await getRepositoryForCompany<User>(User, schema);
    if (createUserDto.password) {
      createUserDto["password"] = await bcrypt.hash(
        createUserDto.password.toString(),
        10
      );
    }
    const { reportingToIds, ...rest } = createUserDto;
    const newUser: any = repo.create(rest);
    if (reportingToIds?.length) {
      const reportingToUsers = await this.findUsersByIds(repo, reportingToIds);
      newUser.reportingTo = reportingToUsers;
    }
    return await repo.save(newUser);
  }

  async getAllUsersFromAllSchemas(reqQuery: any): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: any[];
  }> {
    const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;
    const sortField = reqQuery.sortField ?? "created_at";
    const sortDirection =
      reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";
    let status = reqQuery.status;
    const { repo: anyRepo } = await getRepositoryForCompany<User>(
      User,
      "public"
    );
    const dataSource = anyRepo.manager.connection;

    const schemasResult = await dataSource.query(`
    SELECT table_schema
    FROM information_schema.tables
    WHERE table_name = 'user'
      AND table_type = 'BASE TABLE'
  `);
    const schemas = schemasResult.map((row: any) => row.table_schema);

    if (schemas.length === 0) {
      return {
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        list: [],
      };
    }

    // Build UNION query with JOINs for all schemas
    const statusFilter =
      status && status.toLowerCase() !== "all"
        ? `WHERE u.status = '${status}'`
        : "";

    const unionQueries = schemas.map(
      (schema) => `
    SELECT 
      u.id,
      u.email,
      u."firstName",
      u."lastName",
      u."phoneNumber",
      u."countryCode",
      u."jobTitle",
      u."schemaName",
      u."departmentId",
      u.status,
      u."active_token",
      u."resetTokenExpires",
      u."roleId",
      u."organizationID",
      u."territoryId",
      u."created_at",
      u."updated_at",
      '${schema}' as schemaName,

      json_build_object(
        'organizationID', org."organizationID",
        'name', org."name",
        'website', org."website",
        'description', org."description",
        'address', org."address",
        'city', org."city",
        'state', org."state",
        'zipCode', org."zipCode"
      ) as organization,

      json_build_object(
        'roleId', r."roleId",
        'roleName', r."roleName",
        'isActive', r."isActive",
        'organizationID', r."organizationID",
        'createdDate', r."createdDate",
        'modifiedDate', r."modifiedDate"
      ) as role,

      json_build_object(
        'departmentId', d."departmentId",
        'departmentName', d."departmentName",
        'departmentKey', d."departmentKey",
        'isActive', d."isActive",
        'createdDate', d."createdDate",
        'modifiedDate', d."modifiedDate"
      ) as department,

      json_build_object(
        'id', t.id,
        'name', t.name,
        'createdDate', t."createdDate",
        'modifiedDate', t."modifiedDate"
      ) as territory

    FROM "${schema}"."user" u
    LEFT JOIN "public"."organization" org ON u."organizationID" = org."organizationID"
    LEFT JOIN "${schema}"."role" r ON u."roleId" = r."roleId"
    LEFT JOIN "public"."department" d ON u."departmentId" = d."departmentId"
    LEFT JOIN "${schema}"."userTerritory" t ON u."territoryId" = t.id
    ${statusFilter}
  `
    );
    const unionQuery = unionQueries.join(" UNION ALL ");

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM (${unionQuery}) as combined_users`;
    const countResult = await dataSource.query(countQuery);
    const totalCount = parseInt(countResult[0].total, 10);

    // Get paginated results
    const paginatedQuery = `
    SELECT * FROM (${unionQuery}) as combined_users
    ORDER BY ${sortField} ${sortDirection}
    LIMIT ${limit} OFFSET ${offset}
  `;

    const users = await dataSource.query(paginatedQuery);

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list: users,
    };
  }

  async getUsers(
    reqQuery: any,
    schema: string
  ): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: User[];
  }> {
    const { repo } = await getRepositoryForCompany<User>(User, schema);

    const hasPagination = reqQuery.page && reqQuery.limit;
    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "created_at";
    const sortDirection =
      reqQuery.sort?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereCondition: FindOptionsWhere<User> = {};

    if (reqQuery.organizationId && reqQuery.organizationId !== "") {
      whereCondition.organizationID = reqQuery.organizationId;
    }

    if (reqQuery.roleId && reqQuery.roleId !== "") {
      whereCondition.roleId = reqQuery.roleId;
    }

    if (reqQuery.territoryId && reqQuery.territoryId !== "") {
      whereCondition.territoryId = reqQuery.territoryId;
    }

    let items: User[];
    let totalCount: number;

    if (hasPagination) {
      [items, totalCount] = await repo.findAndCount({
        where: whereCondition,
        order: { [sortField]: sortDirection },
        relations: ["territory", "reportingTo", "role"],
        skip: offset,
        take: limit,
      });
    } else {
      items = await repo.find({
        where: whereCondition,
        order: { [sortField]: sortDirection },
        relations: [],
      });
      totalCount = items.length;
    }

    const totalPages = hasPagination ? Math.ceil(totalCount / limit) : 1;

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list: items,
    };
  }

  async getUserById(userId: string, schema: string): Promise<User> {
    const { repo } = await getRepositoryForCompany<User>(User, schema);
    const user = await repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
    return user;
  }

  async updateUser(
    userId: string,
    updateUserDto: any,
    schema: string
  ): Promise<User> {
    const { reportingToIds, ...rest } = updateUserDto;
    const user = await this.getUserById(userId, schema);

    if (rest.password) {
      rest.password = await bcrypt.hash(rest.password.toString(), 10);
    }

    Object.assign(user, rest);

    const { repo } = await getRepositoryForCompany<User>(User, schema);

    if (reportingToIds && Array.isArray(reportingToIds)) {
      const reportingToUsers = await this.findUsersByIds(repo, reportingToIds);
      user.reportingTo = reportingToUsers;
    }

    return await repo.save(user);
  }

  async deleteUser(userId: string, schema: string): Promise<boolean> {
    const user = await this.getUserById(userId, schema);
    const { repo } = await getRepositoryForCompany<User>(User, schema);
    await repo.softRemove(user);
    return true;
  }

  async findOne(email: string, schema: string): Promise<User | undefined> {
    const { repo } = await getRepositoryForCompany<User>(User, schema);
    return await repo.findOne({ where: { email } });
  }

  async findById(userId: string, schema: string): Promise<User | undefined> {
    const { repo } = await getRepositoryForCompany<User>(User, schema);
    return await repo.findOne({ where: { id: userId } });
  }

  async getDetails(query: any, schema: string): Promise<User | undefined> {
    const { repo } = await getRepositoryForCompany<User>(User, schema);
    return await repo.findOne({ where: query });
  }

  async update(user: User, schema: string): Promise<User> {
    const { repo } = await getRepositoryForCompany<User>(User, schema);
    return await repo.save(user);
  }

  async findUsersByIds(repo: Repository<User>, ids: string[]): Promise<User[]> {
    if (!ids?.length) return [];
    return await repo.find({
      where: {
        id: In(ids),
      },
    });
  }

  async updateWithPayload(
    id: string,
    payload: Partial<User>,
    schema: string
  ): Promise<User> {
    const { repo } = await getRepositoryForCompany<User>(User, schema);
    const result = await repo.update({ id }, payload);
    if (result.affected === 0)
      throw new NotFoundException(`User with id ${id} not found`);
    return await repo.findOne({ where: { id } });
  }

  async countUsers(query: any, schema: string): Promise<number> {
    const { repo } = await getRepositoryForCompany<User>(User, schema);

    // Build dynamic where condition
    const where: any = {};

    if (query.organizationID) {
      where.organizationID = query.organizationID;
    }

    if (query.roleId) {
      where.roleId = query.roleId;
    }

    // Add more conditions as needed
    return await repo.count({ where });
  }
  async storeResetToken(
    user: any,
    token: string,
    expirationDate: Date,
    schema: string
  ): Promise<void> {
    user.active_token = token;
    user.resetTokenExpires = expirationDate;
    await this.update(user, schema);
  }

  async findByQuery(
    query: any,
    isRelations?: string[],
    fallbackSchema = "public"
  ): Promise<User | undefined> {
    const { repo: anyRepo } = await getRepositoryForCompany<User>(
      User,
      fallbackSchema
    );

    const dataSource = anyRepo.manager.connection;
    const schemasResult = await dataSource.query(`
      SELECT table_schema
      FROM information_schema.tables
      WHERE table_name = 'user'
        AND table_type = 'BASE TABLE'
    `);
    const schemas = schemasResult.map((row: any) => row.table_schema);
    let userData: User | undefined;

    for (const schema of schemas) {
      try {
        const { repo } = await getRepositoryForCompany<User>(User, schema);
        const foundUser = await repo.findOne({
          where: query,
          relations: isRelations,
        });
        if (foundUser) {
          userData = foundUser;
          break;
        }
      } catch (err) {
        console.log(`Exception while doing something: ${err?.message}`);
        continue;
      }
    }
    return userData;
  }

  async getUserStatusCounts(fallbackSchema = "public"): Promise<{
    [status: string]: number;
  }> {
    const statusCounts = {
      [USER_STATUS.CREATED]: 0,
      [USER_STATUS.PENDING]: 0,
      [USER_STATUS.VERIFIED]: 0,
      [USER_STATUS.REJECTED]: 0,
    };

    const { repo: anyRepo } = await getRepositoryForCompany<User>(
      User,
      fallbackSchema
    );
    const dataSource = anyRepo.manager.connection;

    const schemasResult = await dataSource.query(`
    SELECT table_schema
    FROM information_schema.tables
    WHERE table_name = 'user'
      AND table_type = 'BASE TABLE'
  `);

    const schemas = schemasResult.map((row: any) => row.table_schema);

    for (const schema of schemas) {
      try {
        const { repo } = await getRepositoryForCompany<User>(User, schema);

        const counts = await repo
          .createQueryBuilder("user")
          .select("user.status", "status")
          .addSelect("COUNT(*)", "count")
          .where("user.status IN (:...statuses)", {
            statuses: Object.values(USER_STATUS),
          })
          .groupBy("user.status")
          .getRawMany();

        for (const row of counts) {
          const status = row.status;
          const count = parseInt(row.count, 10);
          if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status] += count;
          }
        }
      } catch (err) {
        console.log(`Error counting users in schema ${schema}: ${err.message}`);
        continue;
      }
    }

    return statusCounts;
  }

  async getDownlineUserIds(
    loggedInUserId: string,
    schema: string
  ): Promise<string[]> {
    const { dataSource } = await getRepositoryForCompany(User, schema);
    const result = await dataSource.query(
      `WITH RECURSIVE user_hierarchy AS (
      SELECT id FROM "user" WHERE id = $1
      UNION
      SELECT ur."userId"
      FROM "userReporting" ur
      INNER JOIN user_hierarchy uh ON uh.id = ur."reportingToId"
    )
    SELECT id FROM user_hierarchy WHERE id != $1;`,
      [loggedInUserId]
    );
    return result.map((r) => r.id);
  }

  async deleteToken(token: string, fallbackSchema = "public"): Promise<void> {
    const user = await this.findByQuery({ token }, [], fallbackSchema);
    if (user) {
      user.active_token = null;
      user.resetTokenExpires = null;
      const { repo } = await getRepositoryForCompany<User>(
        User,
        fallbackSchema
      );
      await repo.save(user);
    }
  }
}
