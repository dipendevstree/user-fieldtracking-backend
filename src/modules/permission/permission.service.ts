import { Injectable, NotFoundException } from "@nestjs/common";
import { Permission } from "./permission.entity";
import { CreatePermissionDto } from "./dtos/create-permission.dto";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { commonFunctions } from "helper";
@Injectable()
export class PermissionService {
  async isExist(query: any, schema: string) {
    const { repo } = await getRepositoryForCompany<Permission>(
      Permission,
      schema
    );
    return await repo.findOne({ where: query });
  }

  async createPermission(createDto: CreatePermissionDto, schema: string) {
    const { repo } = await getRepositoryForCompany<Permission>(
      Permission,
      schema
    );
    const newPermission = repo.create(createDto);
    return await repo.save(newPermission);
  }

  async getPermissions(reqQuery: any, schema: string) {
    const hasPagination = reqQuery.page && reqQuery.limit;

    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

    const { repo } = await getRepositoryForCompany<Permission>(
      Permission,
      schema
    );

    let list: Permission[];
    let totalCount: number;
    let whereCondition: Partial<Permission> = {};
    if (reqQuery.organizationId) {
      whereCondition["organizationId"] = reqQuery.organizationId;
    }
    if (reqQuery.roleId) {
      whereCondition["roleId"] = reqQuery.roleId;
    }
    if (hasPagination) {
      [list, totalCount] = await repo.findAndCount({
        where: whereCondition,
        order: {
          [sortField]: sortDirection,
        },
        relations: ["organizationMenu"],
        skip: offset,
        take: limit,
      });
    } else {
      list = await repo.find({
        where: whereCondition,
        order: {
          [sortField]: sortDirection,
        },
        relations: ["organizationMenu"],
      });
      totalCount = list.length;
    }

    const totalPages = hasPagination ? Math.ceil(totalCount / limit) : 1;

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list: commonFunctions.groupPermissionsByModule(list),
    };
  }
  async createMultiplePermissions(
    dtos: CreatePermissionDto[],
    schema: string
  ): Promise<Permission[]> {
    const { repo } = await getRepositoryForCompany<Permission>(
      Permission,
      schema
    );
    const newPermissions = repo.create(dtos);
    return await repo.save(newPermissions);
  }
  async getPermissionById(permissionId: string, schema: string) {
    const { repo } = await getRepositoryForCompany<Permission>(
      Permission,
      schema
    );
    const data = await repo.findOne({ where: { permissionId } });
    if (!data) {
      throw new NotFoundException(
        `Permission with ID ${permissionId} not found`
      );
    }
    return data;
  }

  async updatePermission(id: string, updateDto: any, schema: string) {
    const existing = await this.getPermissionById(id, schema);
    const { repo } = await getRepositoryForCompany<Permission>(
      Permission,
      schema
    );
    Object.assign(existing, updateDto);
    return await repo.save(existing);
  }

  async deletePermission(id: string, schema: string) {
    const { repo } = await getRepositoryForCompany<Permission>(
      Permission,
      schema
    );
    const permission = await this.getPermissionById(id, schema);
    return await repo.remove(permission);
  }

  async deleteByQuery(
    where: Partial<Permission>,
    schema: string
  ): Promise<any> {
    const { repo } = await getRepositoryForCompany<Permission>(
      Permission,
      schema
    );
    return await repo.softDelete(where);
  }
}
