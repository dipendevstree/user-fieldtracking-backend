import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrganizationType } from "./organizationType.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CreateOrganizationTypeDto } from "./dtos/create-organizationType.dto";
import { UpdateOrganizationTypeDto } from "./dtos/update-organizationType.dto";

@Injectable()
export class OrganizationTypeService {
  constructor(
    @InjectRepository(OrganizationType)
    private readonly organizationTypeRepository: Repository<OrganizationType>
  ) {}

  async isExist(query: any): Promise<OrganizationType | undefined> {
    return await this.organizationTypeRepository.findOne({ where: query });
  }

  async create(
    createDto: CreateOrganizationTypeDto,
    schema?: string
  ): Promise<OrganizationType> {
    const { repo } = await getRepositoryForCompany<OrganizationType>(
      OrganizationType,
      schema
    );
    const organizationType = repo.create({
      ...createDto,
    });
    return await repo.save(organizationType);
  }

  async getOrganizationType(reqQuery: any): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: OrganizationType[];
  }> {
    const hasPagination = reqQuery.page && reqQuery.limit;

    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

    let organizationType: OrganizationType[];
    let totalCount: number;

    if (hasPagination) {
      [organizationType, totalCount] =
        await this.organizationTypeRepository.findAndCount({
          where: { isActive: true },
          relations: ["createdByData"],
          order: { [sortField]: sortDirection },
          skip: offset,
          take: limit,
        });
    } else {
      organizationType = await this.organizationTypeRepository.find({
        where: { isActive: true },
        relations: ["createdByData"],
        order: { [sortField]: sortDirection },
      });
      totalCount = organizationType.length;
    }

    const totalPages = hasPagination ? Math.ceil(totalCount / limit) : 1;

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list: organizationType,
    };
  }

  async getOrganizationTypeById(id: any): Promise<OrganizationType> {
    const organizationType = await this.organizationTypeRepository.findOne({
      where: { organizationTypeId: id, isActive: true },
    });
    return organizationType;
  }

  async updateDepartment(
    id: any,
    updateDepartmentDto: UpdateOrganizationTypeDto
  ): Promise<OrganizationType> {
    const organizationType = await this.getOrganizationTypeById(id);
    Object.assign(organizationType, updateDepartmentDto);
    return await this.organizationTypeRepository.save(organizationType);
  }

  async getDetails(query: any) {
    return await this.organizationTypeRepository.findOne({ where: query });
  }

  async update(organizationType: OrganizationType): Promise<OrganizationType> {
    return await this.organizationTypeRepository.save(organizationType);
  }

  async deleteOrganizationType(id: string) {
    const organizationType = await this.getOrganizationTypeById(id);
    return await this.organizationTypeRepository.softRemove(organizationType);
  }
}
