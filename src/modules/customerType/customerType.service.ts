import { Injectable, NotFoundException } from "@nestjs/common";
import { DeepPartial, FindOptionsWhere } from "typeorm";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CustomerType } from "./customerType.entity";
import { CreateCustomerTypeDto } from "./dtos/create-customerType.dto";

@Injectable()
export class CustomerTypeService {
  async isExist(query: any, schema: string): Promise<CustomerType | undefined> {
    const { repo } = await getRepositoryForCompany<CustomerType>(
      CustomerType,
      schema
    );
    return await repo.findOne({ where: query });
  }

  async create(
    dto: CreateCustomerTypeDto,
    schema: string
  ): Promise<CustomerType> {
    const { repo } = await getRepositoryForCompany<CustomerType>(
      CustomerType,
      schema
    );
    const entity = repo.create(dto as DeepPartial<CustomerType>);
    return await repo.save(entity);
  }

  async getAll(
    reqQuery: any,
    schema: string
  ): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: CustomerType[];
  }> {
    const { repo } = await getRepositoryForCompany<CustomerType>(
      CustomerType,
      schema
    );
    const hasPagination = reqQuery.page && reqQuery.limit;
    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort?.toLowerCase() === "asc" ? "ASC" : "DESC";

    let items: CustomerType[];
    let totalCount: number;
    let whereCondition: FindOptionsWhere<CustomerType> = {};

    if (reqQuery.organizationId) {
      whereCondition.organizationId = reqQuery.organizationId;
    }

    if (hasPagination) {
      [items, totalCount] = await repo.findAndCount({
        where: whereCondition,
        order: { [sortField]: sortDirection },
        skip: offset,
        take: limit,
      });
    } else {
      items = await repo.find({ where: whereCondition });
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

  async getById(id: string, schema: string): Promise<CustomerType> {
    const { repo } = await getRepositoryForCompany<CustomerType>(
      CustomerType,
      schema
    );
    const record = await repo.findOne({ where: { customerTypeId: id } });
    if (!record) {
      throw new NotFoundException(`CustomerType with ID ${id} not found`);
    }
    return record;
  }

  async update(payload: CustomerType, schema: string): Promise<CustomerType> {
    const { repo } = await getRepositoryForCompany<CustomerType>(
      CustomerType,
      schema
    );
    return await repo.save(payload);
  }

  async delete(id: string, schema: string): Promise<CustomerType> {
    const { repo } = await getRepositoryForCompany<CustomerType>(
      CustomerType,
      schema
    );
    const record = await this.getById(id, schema);
    return await repo.softRemove(record);
  }
}
