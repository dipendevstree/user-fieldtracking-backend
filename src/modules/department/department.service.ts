import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Department } from "./department.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CreateDepartmentDto } from "./dtos/create-department.dto";
import { UpdateDepartmentDto } from "./dtos/update-department.dto";

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>
  ) {}

  async isExist(query: any): Promise<Department | undefined> {
    return await this.departmentRepository.findOne({ where: query });
  }

  async create(
    createDepartmentDto: CreateDepartmentDto,
    schema?: string
  ): Promise<Department> {
    const { repo } = await getRepositoryForCompany<Department>(
      Department,
      schema
    );
    const department = repo.create({
      ...createDepartmentDto,
    });
    return await repo.save(department);
  }

  async getDepartment(reqQuery: any): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: Department[];
  }> {
    const hasPagination = reqQuery.page && reqQuery.limit;

    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

    let departments: Department[];
    let totalCount: number;

    if (hasPagination) {
      [departments, totalCount] = await this.departmentRepository.findAndCount({
        where: { isActive: true },
        order: { [sortField]: sortDirection },
        skip: offset,
        take: limit,
      });
    } else {
      departments = await this.departmentRepository.find({
        where: { isActive: true },
        order: { [sortField]: sortDirection },
      });
      totalCount = departments.length;
    }

    const totalPages = hasPagination ? Math.ceil(totalCount / limit) : 1;

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list: departments,
    };
  }

  async getDepartmentById(id: any): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { departmentId: id, isActive: true },
    });
    return department;
  }

  async updateDepartment(
    id: any,
    updateDepartmentDto: UpdateDepartmentDto
  ): Promise<Department> {
    const department = await this.getDepartmentById(id);
    Object.assign(department, updateDepartmentDto);
    return await this.departmentRepository.save(department);
  }

  async getDetails(query: any) {
    return await this.departmentRepository.findOne({ where: query });
  }

  async update(department: Department): Promise<Department> {
    return await this.departmentRepository.save(department);
  }

  async deleteDepartment(id: string) {
    const department = await this.getDepartmentById(id);
    return await this.departmentRepository.softRemove(department);
  }
}
