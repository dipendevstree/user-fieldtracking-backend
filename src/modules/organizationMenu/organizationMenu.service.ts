import { Injectable, NotFoundException } from "@nestjs/common";
import { DeepPartial } from "typeorm";
import { OrganizationMenu } from "./organizationMenu.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CreateOrganizationMenuDto } from "./dtos/create-organizationMenu.dto";
import { UpdateOrganizationMenuDto } from "./dtos/update-organizationMenu.dto";

@Injectable()
export class OrganizationMenuService {
  async isExist(
    query: any,
    schema: string
  ): Promise<OrganizationMenu | undefined> {
    const { repo } = await getRepositoryForCompany<OrganizationMenu>(
      OrganizationMenu,
      schema
    );
    return await repo.findOne({ where: query });
  }

  async create(
    createDto: CreateOrganizationMenuDto,
    schema: string
  ): Promise<OrganizationMenu> {
    try {
      const { repo } = await getRepositoryForCompany<OrganizationMenu>(
        OrganizationMenu,
        schema
      );
      const entity = repo.create(createDto as DeepPartial<OrganizationMenu>);
      return await repo.save(entity);
    } catch (error) {
      console.log("create error", error);
      throw error;
    }
  }

  async getAll(
    reqQuery: any,
    schema: string
  ): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: OrganizationMenu[];
  }> {
    const { repo } = await getRepositoryForCompany<OrganizationMenu>(
      OrganizationMenu,
      schema
    );
    const hasPagination = reqQuery.page && reqQuery.limit;
    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort?.toLowerCase() === "acs" ? "ASC" : "DESC";

    let items: OrganizationMenu[];
    let totalCount: number;
    let whereCondition: Partial<OrganizationMenu> = { isActive: true };

    if (reqQuery.organizationId) {
      whereCondition["organizationId"] = reqQuery.organizationId;
    }
    if (reqQuery.masterMenuId) {
      whereCondition["masterMenuId"] = reqQuery.masterMenuId;
    }
    if (hasPagination) {
      [items, totalCount] = await repo.findAndCount({
        where: whereCondition,
        order: { [sortField]: sortDirection },
        skip: offset,
        take: limit,
      });
    } else {
      items = await repo.find({
        where: whereCondition,
        order: { [sortField]: sortDirection },
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

  async getById(id: string, schema: string): Promise<OrganizationMenu> {
    const { repo } = await getRepositoryForCompany<OrganizationMenu>(
      OrganizationMenu,
      schema
    );
    const record = await repo.findOne({
      where: { organizationMenuId: id, isActive: true },
    });
    if (!record) {
      throw new NotFoundException(`OrganizationMenu with ID ${id} not found`);
    }
    return record;
  }

  async updateOrganizationMenu(
    id: string,
    updateDto: UpdateOrganizationMenuDto,
    schema: string
  ): Promise<OrganizationMenu> {
    const { repo } = await getRepositoryForCompany<OrganizationMenu>(
      OrganizationMenu,
      schema
    );
    const record = await this.getById(id, schema);
    Object.assign(record, updateDto);
    return await repo.save(record);
  }

  async getDetails(
    query: any,
    schema: string
  ): Promise<OrganizationMenu | undefined> {
    const repository = (
      await getRepositoryForCompany<OrganizationMenu>(OrganizationMenu, schema)
    ).repo;

    const found = await repository.findOne({
      where: { ...query },
    });

    return found ?? undefined;
  }

  async update(
    payload: OrganizationMenu,
    schema: string
  ): Promise<OrganizationMenu> {
    const { repo } = await getRepositoryForCompany<OrganizationMenu>(
      OrganizationMenu,
      schema
    );
    return await repo.save(payload);
  }

  async delete(id: string, schema: string): Promise<OrganizationMenu> {
    const { repo } = await getRepositoryForCompany<OrganizationMenu>(
      OrganizationMenu,
      schema
    );
    const record = await this.getById(id, schema);
    return await repo.softRemove(record);
  }
}
