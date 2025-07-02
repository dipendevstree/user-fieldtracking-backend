import { Injectable, NotFoundException } from "@nestjs/common";
import { DeepPartial } from "typeorm";
import { FindOptionsWhere } from "typeorm";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CustomerContact } from "./customerContact.entity";
import { CreateCustomerContactDto } from "./dtos/create-customerContact.dto";

@Injectable()
export class CustomerContactService {
  async isExist(
    query: any,
    schema: string
  ): Promise<CustomerContact | undefined> {
    const { repo } = await getRepositoryForCompany<CustomerContact>(
      CustomerContact,
      schema
    );
    return await repo.findOne({ where: query });
  }

  async create(
    createDto: CreateCustomerContactDto,
    schema: string
  ): Promise<CustomerContact> {
    const { repo } = await getRepositoryForCompany<CustomerContact>(
      CustomerContact,
      schema
    );
    const entity = repo.create(createDto as DeepPartial<CustomerContact>);
    return await repo.save(entity);
  }

  async getAll(
    reqQuery: any,
    schema: string
  ): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: CustomerContact[];
  }> {
    const { repo } = await getRepositoryForCompany<CustomerContact>(
      CustomerContact,
      schema
    );
    const hasPagination = reqQuery.page && reqQuery.limit;
    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort?.toLowerCase() === "desc" ? "DESC" : "ASC";

    let whereCondition: FindOptionsWhere<CustomerContact> = {};

    if (reqQuery.organizationID) {
      whereCondition["organizationID"] = reqQuery.organizationID;
    }

    let items: CustomerContact[], totalCount: number;

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

    return {
      totalCount,
      totalPages: hasPagination ? Math.ceil(totalCount / limit) : 1,
      currentPage: page,
      list: items,
    };
  }

  async getById(id: string, schema: string): Promise<CustomerContact> {
    const { repo } = await getRepositoryForCompany<CustomerContact>(
      CustomerContact,
      schema
    );
    const record = await repo.findOne({ where: { customerContactId: id } });
    if (!record)
      throw new NotFoundException(`CustomerContact with ID ${id} not found`);
    return record;
  }

  async update(
    payload: CustomerContact,
    schema: string
  ): Promise<CustomerContact> {
    const { repo } = await getRepositoryForCompany<CustomerContact>(
      CustomerContact,
      schema
    );
    return await repo.save(payload);
  }

  async delete(id: string, schema: string): Promise<CustomerContact> {
    const { repo } = await getRepositoryForCompany<CustomerContact>(
      CustomerContact,
      schema
    );
    const record = await this.getById(id, schema);
    return await repo.softRemove(record);
  }
}
