import { Injectable } from "@nestjs/common";
import { Role } from "./role.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { UpdateRoleDto } from "./dtos/update-role.dto";
import { FindOptionsWhere } from "typeorm";
import { UsersService } from "../users/user.service";
@Injectable()
export class RoleService {
  constructor(private readonly usersService: UsersService) {}

  async isExist(query: any, schema?: string): Promise<Role | undefined> {
    const { repo } = await getRepositoryForCompany<Role>(Role, schema);
    return await repo.findOne({ where: query });
  }

  async create(createSuperAdminDto: any, schema?: string): Promise<Role> {
    const { repo } = await getRepositoryForCompany<Role>(Role, schema);
    const role = repo.create({ ...createSuperAdminDto });
    let response: any = await repo.save(role);
    return response;
  }

  async getRole(
    reqQuery: any,
    schema?: string
  ): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: Role[];
  }> {
    const { repo } = await getRepositoryForCompany<Role>(Role, schema);

    const hasPagination = reqQuery.page && reqQuery.limit;

    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

    let list: Role[];
    let totalCount: number;
    const whereCondition: FindOptionsWhere<Role> = { isActive: true };

    if (reqQuery.organizationId && reqQuery.organizationId !== "") {
      whereCondition.organizationID = reqQuery.organizationId;
    }

    if (hasPagination) {
      [list, totalCount] = await repo.findAndCount({
        where: whereCondition,
        order: { [sortField]: sortDirection },
        skip: offset,
        take: limit,
      });
      for (const element of list) {
        const userCount = await this.usersService.countUsers(
          { roleId: element.roleId },
          schema
        );
        element["userCount"] = userCount;
      }
    } else {
      list = await repo.find({
        where: whereCondition,
        order: { [sortField]: sortDirection },
      });
      totalCount = list.length;
    }

    const totalPages = hasPagination ? Math.ceil(totalCount / limit) : 1;

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list,
    };
  }

  async getRoleById(id: string, schema?: string): Promise<Role> {
    const { repo } = await getRepositoryForCompany<Role>(Role, schema);
    let role = await repo.findOne({
      where: { roleId: id, isActive: true },
      relations: ["permissions", "permissions.organizationMenu"],
    });
    return role;
  }

  async updateRole(
    id: string,
    updateRoleDto: UpdateRoleDto,
    schema?: string
  ): Promise<Role> {
    const { repo } = await getRepositoryForCompany<Role>(Role, schema);
    const role = await this.getRoleById(id, schema);
    Object.assign(role, updateRoleDto);
    return await repo.save(role);
  }

  async getDetails(query: any, schema?: string): Promise<Role | undefined> {
    const { repo } = await getRepositoryForCompany<Role>(Role, schema);
    return await repo.findOne({ where: query });
  }

  async update(role: Role, schema?: string): Promise<Role> {
    const { repo } = await getRepositoryForCompany<Role>(Role, schema);
    return await repo.save(role);
  }

  async delete(id: string, schema?: string): Promise<Role> {
    const { repo } = await getRepositoryForCompany<Role>(Role, schema);
    const role = await this.getRoleById(id, schema);
    return await repo.softRemove(role);
  }
}
