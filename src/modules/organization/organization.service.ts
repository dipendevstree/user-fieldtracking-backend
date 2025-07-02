import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Organization } from "./organization.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { UsersService } from "../users/user.service";
import { ILike, FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly usersService: UsersService
  ) {}

  async isExist(query: any) {
    return await this.organizationRepository.findOne({ where: query });
  }

  async createOrganizationForSchema(CreateOrgDto: any, schema: string) {
    const { repo } = await getRepositoryForCompany<Organization>(
      Organization,
      schema
    );
    const newOrganization = repo.create(CreateOrgDto);
    return await repo.save(newOrganization);
  }
  async createOrganization(CreateOrgDto: any) {
    const newOrganization = this.organizationRepository.create(CreateOrgDto);
    return await this.organizationRepository.save(newOrganization);
  }

  async getOrganization(reqQuery: any): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: Organization[];
  }> {
    const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;

    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort && reqQuery.sort.toLowerCase() === "asc" ? "ASC" : "DESC";
    let whereCondition: FindOptionsWhere<Organization> = {};

    if (reqQuery.searchFor && reqQuery.searchFor.trim() !== "") {
      whereCondition.organizationName = ILike(`%${reqQuery.searchFor}%`);
    }
    if (reqQuery.industryId && reqQuery.industryId !== "") {
      whereCondition.industryId = reqQuery.industryId;
    }
    if (reqQuery.organizationTypeId && reqQuery.organizationTypeId !== "") {
      whereCondition.organizationTypeId = reqQuery.organizationTypeId;
    }
    const [organizations, totalCount] =
      await this.organizationRepository.findAndCount({
        where: whereCondition,
        relations: ["employeeRang", "industry"],
        order: {
          [sortField]: sortDirection,
        },
        skip: offset,
        take: limit,
      });

    const totalPages = Math.ceil(totalCount / limit);
    for (const organization of organizations) {
      organization["userCount"] = await this.usersService.countUsers(
        {
          organizationID: organization.organizationID,
        },
        organization.organizationSchema
      );
      organization["adminData"] = await this.usersService.findByQuery(
        { id: organization.adminUserId },
        []
      );
    }
    return {
      totalCount,
      totalPages,
      currentPage: page,
      list: organizations,
    };
  }

  async getOrganizationById(id: any) {
    const organization = await this.organizationRepository.findOne({
      where: { organizationID: id },
    });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  async updateOrganization(id: string, updateOrgDto: any) {
    const organization = await this.getOrganizationById(id);
    Object.assign(organization, updateOrgDto);
    return await this.organizationRepository.save(organization);
  }

  async deleteOrganization(id: string) {
    const organization = await this.getOrganizationById(id);
    return await this.organizationRepository.remove(organization);
  }

  async getOrganizationAnalytics() {
    const userStatusCounts = await this.usersService.getUserStatusCounts();
    const totalOrganizations = await this.organizationRepository.count({
      where: { isActive: true },
    });
    return { userStatusCounts, totalOrganizations };
  }
}
