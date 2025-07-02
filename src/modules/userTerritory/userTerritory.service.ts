import { Injectable, NotFoundException } from "@nestjs/common";
import { DeepPartial, FindOptionsWhere } from "typeorm";
import { UserTerritory } from "./userTerritory.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CreateUserTerritoryDto } from "./dtos/create-userTerritory.dto";

@Injectable()
export class UserTerritoryService {
  async isExist(
    query: any,
    schema: string
  ): Promise<UserTerritory | undefined> {
    const { repo } = await getRepositoryForCompany<UserTerritory>(
      UserTerritory,
      schema
    );
    return await repo.findOne({ where: query });
  }

  async create(
    dto: CreateUserTerritoryDto,
    schema: string
  ): Promise<UserTerritory> {
    const { repo } = await getRepositoryForCompany<UserTerritory>(
      UserTerritory,
      schema
    );
    console.log("dtodasdasddadada", dto);
    const entity = repo.create(dto as DeepPartial<UserTerritory>);
    return await repo.save(entity);
  }

  async getAll(
    reqQuery: any,
    schema: string
  ): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: UserTerritory[];
  }> {
    const { repo } = await getRepositoryForCompany<UserTerritory>(
      UserTerritory,
      schema
    );
    const hasPagination = reqQuery.page && reqQuery.limit;
    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort?.toLowerCase() === "desc" ? "DESC" : "ASC";

    let whereCondition: FindOptionsWhere<UserTerritory> = {};

    if (reqQuery.organizationId) {
      whereCondition.organizationId = reqQuery.organizationId;
    }

    const [items, totalCount] = await repo.findAndCount({
      where: whereCondition,
      order: { [sortField]: sortDirection },
      skip: offset,
      take: limit,
    });

    const totalPages = hasPagination ? Math.ceil(totalCount / limit) : 1;

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list: items,
    };
  }

  async getById(id: string, schema: string): Promise<UserTerritory> {
    const { repo } = await getRepositoryForCompany<UserTerritory>(
      UserTerritory,
      schema
    );
    const record = await repo.findOne({ where: { id } });
    if (!record)
      throw new NotFoundException(`UserTerritory with ID ${id} not found`);
    return record;
  }

  async update(entity: UserTerritory, schema: string): Promise<UserTerritory> {
    const { repo } = await getRepositoryForCompany<UserTerritory>(
      UserTerritory,
      schema
    );
    return await repo.save(entity);
  }

  async delete(id: string, schema: string): Promise<UserTerritory> {
    const { repo } = await getRepositoryForCompany<UserTerritory>(
      UserTerritory,
      schema
    );
    const record = await this.getById(id, schema);
    return await repo.softRemove(record);
  }
}
