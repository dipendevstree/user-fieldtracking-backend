import { Injectable, NotFoundException } from "@nestjs/common";
import { DeepPartial } from "typeorm";
import { LiveTracking } from "./liveTracking.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CreateLiveTrackingDto } from "./dtos/create-liveTracking.dto";
import { UpdateLiveTrackingDto } from "./dtos/update-liveTracking.dto";

@Injectable()
export class LiveTrackingService {
  async isExist(query: any, schema: string): Promise<LiveTracking | undefined> {
    const { repo } = await getRepositoryForCompany<LiveTracking>(
      LiveTracking,
      schema
    );
    return await repo.findOne({ where: query });
  }

  async create(
    createDto: CreateLiveTrackingDto,
    schema: string
  ): Promise<LiveTracking> {
    const { repo } = await getRepositoryForCompany<LiveTracking>(
      LiveTracking,
      schema
    );
    const entity = repo.create(createDto as DeepPartial<LiveTracking>);
    return await repo.save(entity);
  }

  async getAll(
    reqQuery: any,
    schema: string
  ): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: LiveTracking[];
  }> {
    const { repo } = await getRepositoryForCompany<LiveTracking>(
      LiveTracking,
      schema
    );
    const hasPagination = reqQuery.page && reqQuery.limit;
    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort?.toLowerCase() === "desc" ? "DESC" : "ASC";

    const [items, totalCount] = await repo.findAndCount({
      where: {},
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
  async getAllWithQuery(query: any, schema: string): Promise<LiveTracking[]> {
    const { repo } = await getRepositoryForCompany<LiveTracking>(
      LiveTracking,
      schema
    );

    const whereCondition: any = {};
    if (query?.userId && query?.userId != "") {
      whereCondition["userId"] = query?.userId;
    }

    const items = await repo.find({
      where: whereCondition,
      order: { createdDate: "DESC" },
    });

    return items;
  }

  async getById(id: string, schema: string): Promise<LiveTracking> {
    const { repo } = await getRepositoryForCompany<LiveTracking>(
      LiveTracking,
      schema
    );
    const record = await repo.findOne({ where: { liveTrackingId: id } });
    if (!record) throw new NotFoundException(`LiveTracking ${id} not found`);
    return record;
  }

  async updateLiveTracking(
    id: string,
    updateDto: UpdateLiveTrackingDto,
    schema: string
  ): Promise<LiveTracking> {
    const { repo } = await getRepositoryForCompany<LiveTracking>(
      LiveTracking,
      schema
    );
    const record = await this.getById(id, schema);
    Object.assign(record, updateDto);
    return await repo.save(record);
  }

  async update(payload: LiveTracking, schema: string): Promise<LiveTracking> {
    const { repo } = await getRepositoryForCompany<LiveTracking>(
      LiveTracking,
      schema
    );
    return await repo.save(payload);
  }

  async delete(id: string, schema: string): Promise<LiveTracking> {
    const { repo } = await getRepositoryForCompany<LiveTracking>(
      LiveTracking,
      schema
    );
    const record = await this.getById(id, schema);
    return await repo.softRemove(record);
  }
}
