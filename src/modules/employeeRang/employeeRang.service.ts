import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EmployeeRang } from "./employeeRang.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CreateEmployeeRangDto } from "./dtos/create-employeeRang.dto";
import { UpdateEmployeeRangDto } from "./dtos/update-employeeRang.dto";

@Injectable()
export class EmployeeRangService {
  constructor(
    @InjectRepository(EmployeeRang)
    private readonly employeeRangRepository: Repository<EmployeeRang>
  ) {}

  async isExist(query: any): Promise<EmployeeRang | undefined> {
    return await this.employeeRangRepository.findOne({ where: query });
  }

  async createEmployeeRang(
    createSuperAdminDto: CreateEmployeeRangDto,
    schema?: string
  ): Promise<EmployeeRang> {
    console.log("createSuperAdminDto", createSuperAdminDto);
    const { repo } = await getRepositoryForCompany<EmployeeRang>(
      EmployeeRang,
      schema
    );
    const newUser = repo.create({
      ...createSuperAdminDto,
    });
    return await repo.save(newUser);
  }

  async getEmployeeRang(reqQuery: any): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: EmployeeRang[];
  }> {
    const hasPagination = reqQuery.page && reqQuery.limit;

    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

    let employeeRang: EmployeeRang[];
    let totalCount: number;

    if (hasPagination) {
      [employeeRang, totalCount] =
        await this.employeeRangRepository.findAndCount({
          where: { isActive: true },
          order: { [sortField]: sortDirection },
          skip: offset,
          take: limit,
        });
    } else {
      employeeRang = await this.employeeRangRepository.find({
        where: { isActive: true },
        order: { [sortField]: sortDirection },
      });
      totalCount = employeeRang.length;
    }

    const totalPages = hasPagination ? Math.ceil(totalCount / limit) : 1;

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list: employeeRang,
    };
  }
  async getEmployeeRangById(id: any): Promise<EmployeeRang> {
    const user = await this.employeeRangRepository.findOne({
      where: { employeeRangeId: id },
    });
    return user;
  }

  async updateEmployeeRang(
    id: any,
    updateEmployeeRangDto: UpdateEmployeeRangDto
  ): Promise<EmployeeRang> {
    const employeeRang = await this.getEmployeeRangById(id);
    Object.assign(employeeRang, updateEmployeeRangDto);
    return await this.employeeRangRepository.save(employeeRang);
  }

  async deleteEmployeeRang(id: any): Promise<boolean> {
    const user = await this.getEmployeeRangById(id);
    await this.employeeRangRepository.remove(user);
    return true;
  }

  async getDetails(query: any) {
    return await this.employeeRangRepository.findOne({ where: query });
  }

  async update(employeeRang: EmployeeRang): Promise<EmployeeRang> {
    return await this.employeeRangRepository.save(employeeRang);
  }
  async delete(id: string) {
    const user = await this.getEmployeeRangById(id);
    return await this.employeeRangRepository.softRemove(user);
  }
}
