import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { SuperAdmin } from "./superAdmin.entity";
import * as bcrypt from "bcryptjs";
import { UpdateUserDto } from "../users/dtos/update-users.dto";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CreateSuperAdminDto } from "./dtos/create-superAdmin.dto";

@Injectable()
export class SuperAdminService {
  constructor(
    @InjectRepository(SuperAdmin)
    private readonly usersRepository: Repository<SuperAdmin>
  ) {}

  async isExist(query: any): Promise<SuperAdmin | undefined> {
    return await this.usersRepository.findOne({ where: query });
  }

  async createSuperAdmin(
    createSuperAdminDto: CreateSuperAdminDto,
    schema?: string
  ): Promise<SuperAdmin> {
    const { repo } = await getRepositoryForCompany<SuperAdmin>(
      SuperAdmin,
      schema
    );
    const hashedPassword = await bcrypt.hash(createSuperAdminDto.password, 10);
    const newUser = repo.create({
      ...createSuperAdminDto,
      password: hashedPassword,
    });
    return await repo.save(newUser);
  }

  async getSuperAdmin(reqQuery: any): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: SuperAdmin[];
  }> {
    const page = reqQuery.page ? parseInt(reqQuery.page, 10) : 1;
    const limit = reqQuery.limit ? parseInt(reqQuery.limit, 10) : 10;

    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort && reqQuery.sort.toLowerCase() === "desc" ? "DESC" : "ASC";

    const [users, totalCount] = await this.usersRepository.findAndCount({
      where: { isActive: true },
      order: {
        [sortField]: sortDirection,
      },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      totalCount,
      totalPages,
      currentPage: page,
      list: users,
    };
  }

  async getUserById(userId: any): Promise<SuperAdmin> {
    const user = await this.usersRepository.findOne({
      where: { superAdminId: userId },
    });
    return user;
  }
  async getUserByUserName(username: any): Promise<SuperAdmin> {
    const user = await this.usersRepository.findOne({
      where: { userName: username },
    });
    return user;
  }

  async updateUser(
    userId: any,
    updateUserDto: UpdateUserDto
  ): Promise<SuperAdmin> {
    const user = await this.getUserById(userId);
    Object.assign(user, updateUserDto);

    return await this.usersRepository.save(user);
  }

  async deleteUser(userId: any): Promise<boolean> {
    const user = await this.getUserById(userId);
    await this.usersRepository.remove(user);
    return true;
  }

  async getDetails(query: any) {
    return await this.usersRepository.findOne({ where: query });
  }

  async update(user: SuperAdmin): Promise<SuperAdmin> {
    return await this.usersRepository.save(user);
  }
  async delete(user: SuperAdmin): Promise<SuperAdmin> {
    return await this.usersRepository.save(user);
  }

  async create(reqBody: any): Promise<SuperAdmin> {
    return await this.usersRepository.save(reqBody);
  }

  async findToken(token: string): Promise<SuperAdmin | undefined> {
    return await this.usersRepository.findOne({
      where: {
        resetToken: token,
        resetTokenExpires: MoreThan(new Date()),
      },
    });
  }

  async deleteToken(token: string): Promise<void> {
    const user = await this.findToken(token);
    if (user) {
      user.resetToken = null;
      user.resetTokenExpires = null;
      await this.update(user);
    }
  }

  async deleteSuperAdmin(id: string) {
    const user = await this.getUserById(id);
    return await this.usersRepository.softRemove(user);
  }
}
