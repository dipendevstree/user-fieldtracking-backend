import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Industry } from "./industry.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CreateIndustryDto } from "./dtos/create-industry.dto";
import { UpdateIndustryDto } from "./dtos/update-industry.dto";

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>
  ) {}

  async isExist(query: any): Promise<Industry | undefined> {
    return await this.industryRepository.findOne({ where: query });
  }

  async create(
    createSuperAdminDto: CreateIndustryDto,
    schema?: string
  ): Promise<Industry> {
    const { repo } = await getRepositoryForCompany<Industry>(Industry, schema);
    const industry = repo.create({
      ...createSuperAdminDto,
    });
    return await repo.save(industry);
  }

  async getIndustry(reqQuery: any): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: Industry[];
  }> {
    const hasPagination = reqQuery.page && reqQuery.limit;

    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

    let industry: Industry[];
    let totalCount: number;

    if (hasPagination) {
      [industry, totalCount] = await this.industryRepository.findAndCount({
        where: { isActive: true },
        order: { [sortField]: sortDirection },
        skip: offset,
        take: limit,
      });
    } else {
      industry = await this.industryRepository.find({
        where: { isActive: true },
        order: { [sortField]: sortDirection },
      });
      totalCount = industry.length;
    }

    const totalPages = hasPagination ? Math.ceil(totalCount / limit) : 1;

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list: industry,
    };
  }

  async getIndustryById(id: any): Promise<Industry> {
    const industry = await this.industryRepository.findOne({
      where: { industryId: id, isActive: true },
    });
    return industry;
  }

  async updateEmployeeRang(
    id: any,
    updateEmployeeRangDto: UpdateIndustryDto
  ): Promise<Industry> {
    const industry = await this.getIndustryById(id);
    Object.assign(industry, updateEmployeeRangDto);
    return await this.industryRepository.save(industry);
  }

  async getDetails(query: any) {
    return await this.industryRepository.findOne({ where: query });
  }

  async update(industry: Industry): Promise<Industry> {
    return await this.industryRepository.save(industry);
  }
  async deleteIndustry(id: string) {
    const user = await this.getIndustryById(id);
    return await this.industryRepository.softRemove(user);
  }
}
