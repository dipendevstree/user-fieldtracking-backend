import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Menu } from "./menu.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CreateMenuDto } from "./dtos/create-menu.dto";
import { UpdateMenuDto } from "./dtos/update-menu.dto";

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>
  ) {}

  async isExist(query: any): Promise<Menu | undefined> {
    const { repo } = await getRepositoryForCompany<Menu>(Menu, "public");
    return await repo.findOne({ where: query });
  }

  async create(
    createSuperAdminDto: CreateMenuDto,
    schema?: string
  ): Promise<Menu> {
    const { repo } = await getRepositoryForCompany<Menu>(Menu, "public");
    const industry = repo.create({
      ...createSuperAdminDto,
    });
    return await repo.save(industry);
  }

  async getMenu(reqQuery: any): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: Menu[];
  }> {
    const hasPagination = reqQuery.page && reqQuery.limit;

    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

    let menus: Menu[];
    let totalCount: number;

    if (hasPagination) {
      [menus, totalCount] = await this.menuRepository.findAndCount({
        where: { isActive: true },
        order: { [sortField]: sortDirection },
        skip: offset,
        take: limit,
      });
    } else {
      menus = await this.menuRepository.find({
        where: { isActive: true },
        order: { [sortField]: sortDirection },
      });
      totalCount = menus.length;
    }

    const totalPages = hasPagination ? Math.ceil(totalCount / limit) : 1;

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list: menus,
    };
  }

  async getMenuById(id: any): Promise<Menu> {
    const industry = await this.menuRepository.findOne({
      where: { menuId: id, isActive: true },
    });
    return industry;
  }

  async updateMenu(
    id: any,
    updateEmployeeRangDto: UpdateMenuDto
  ): Promise<Menu> {
    const industry = await this.getMenuById(id);
    Object.assign(industry, updateEmployeeRangDto);
    return await this.menuRepository.save(industry);
  }

  async getDetails(query: any) {
    return await this.menuRepository.findOne({ where: query });
  }

  async update(industry: Menu): Promise<Menu> {
    return await this.menuRepository.save(industry);
  }
  async deleteMenu(id: string) {
    const user = await this.getMenuById(id);
    return await this.menuRepository.softRemove(user);
  }
}
