import { Injectable, NotFoundException } from "@nestjs/common";
import { DeepPartial } from "typeorm";
import { Customer } from "./customer.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CreateCustomerDto } from "./dtos/create-customer.dto";

@Injectable()
export class CustomerService {
  async create(dto: CreateCustomerDto, schema: string): Promise<Customer> {
    const { repo } = await getRepositoryForCompany<Customer>(Customer, schema);
    const entity = repo.create(dto as DeepPartial<Customer>);
    return await repo.save(entity);
  }
  async isExist(query: any, schema?: string): Promise<Customer | undefined> {
    const { repo } = await getRepositoryForCompany<Customer>(Customer, schema);
    return await repo.findOne({ where: query });
  }

  async getAll(
    reqQuery: any,
    schema: string
  ): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: Customer[];
  }> {
    const { repo } = await getRepositoryForCompany<Customer>(Customer, schema);
    const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;
    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort?.toLowerCase() === "desc" ? "DESC" : "ASC";

    let where: any = { organizationId: reqQuery.organizationId };

    const [items, totalCount] = await repo.findAndCount({
      where,
      order: { [sortField]: sortDirection },
      skip: offset,
      take: limit,
    });

    return {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      list: items,
    };
  }

  async getById(id: string, schema: string): Promise<Customer> {
    const { repo } = await getRepositoryForCompany<Customer>(Customer, schema);
    const record = await repo.findOne({ where: { customerId: id } });
    if (!record)
      throw new NotFoundException(`Customer with ID ${id} not found`);
    return record;
  }

  async update(entity: Customer, schema: string): Promise<Customer> {
    const { repo } = await getRepositoryForCompany<Customer>(Customer, schema);
    return await repo.save(entity);
  }

  async delete(id: string, schema: string): Promise<Customer> {
    const { repo } = await getRepositoryForCompany<Customer>(Customer, schema);
    const record = await this.getById(id, schema);
    return await repo.softRemove(record);
  }
}
