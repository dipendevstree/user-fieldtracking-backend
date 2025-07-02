import { Injectable, NotFoundException } from "@nestjs/common";
import { DeepPartial, Between } from "typeorm";
import { WorkDaySession } from "./workDaySession.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { commonFunctions } from "helper";
import moment from "moment-timezone";
@Injectable()
export class WorkDaySessionService {
  async isExist(query: any, schema: string) {
    const { repo } = await getRepositoryForCompany<WorkDaySession>(
      WorkDaySession,
      schema
    );
    return await repo.findOne({ where: query });
  }

  async create(createDto: any, schema: string) {
    const { repo } = await getRepositoryForCompany<WorkDaySession>(
      WorkDaySession,
      schema
    );
    const entity = repo.create(createDto as DeepPartial<WorkDaySession>);
    return await repo.save(entity);
  }

  async getAll(reqQuery: any, schema: string) {
    const { repo } = await getRepositoryForCompany<WorkDaySession>(
      WorkDaySession,
      schema
    );
    const hasPagination = reqQuery.page && reqQuery.limit;
    const page = hasPagination ? parseInt(reqQuery.page, 10) : 1;
    const limit = hasPagination ? parseInt(reqQuery.limit, 10) : 10;
    const offset = (page - 1) * limit;

    const sortField = reqQuery.sortField ?? "createdDate";
    const sortDirection =
      reqQuery.sort?.toLowerCase() === "desc" ? "DESC" : "ASC";

    let whereCondition: any = {};
    if (reqQuery.organizationId) {
      whereCondition.organizationId = reqQuery.organizationId;
    }

    const [items, totalCount] = hasPagination
      ? await repo.findAndCount({
          where: whereCondition,
          order: { [sortField]: sortDirection },
          skip: offset,
          take: limit,
        })
      : [
          await repo.find({
            where: whereCondition,
            order: { [sortField]: sortDirection },
          }),
          0,
        ];

    return {
      totalCount,
      totalPages: hasPagination ? Math.ceil(totalCount / limit) : 1,
      currentPage: page,
      list: items,
    };
  }

  async getById(id: string, schema: string) {
    const { repo } = await getRepositoryForCompany<WorkDaySession>(
      WorkDaySession,
      schema
    );
    const record = await repo.findOne({ where: { workDaySessionId: id } });
    if (!record) {
      throw new NotFoundException(`WorkDaySession with ID ${id} not found`);
    }
    return record;
  }
  async findByQuery(
    query: any,
    isRelations?: string[],
    fallbackSchema = "public"
  ): Promise<WorkDaySession | undefined> {
    let { appendIfValid } = commonFunctions;
    let { timeZone } = query;
    let whereCondition: any = {
      organizationId: query.organizationId,
      ...appendIfValid("userId", query.userId),
    };

    if (query.date) {
      const startDate = moment.tz(query.date, timeZone).startOf("day").toDate();
      const endDate = moment.tz(query.date, timeZone).endOf("day").toDate();
      whereCondition["date"] = Between(startDate, endDate);
    }
    const { repo } = await getRepositoryForCompany<WorkDaySession>(
      WorkDaySession,
      fallbackSchema
    );

    const findSession = await repo.findOne({
      where: whereCondition,
      relations: isRelations,
    });
    return findSession;
  }

  async update(id: string, updateDto: any, schema: string) {
    const { repo } = await getRepositoryForCompany<WorkDaySession>(
      WorkDaySession,
      schema
    );
    const record = await this.getById(id, schema);
    Object.assign(record, updateDto);
    return await repo.save(record);
  }

  async delete(id: string, schema: string) {
    const { repo } = await getRepositoryForCompany<WorkDaySession>(
      WorkDaySession,
      schema
    );
    const record = await this.getById(id, schema);
    return await repo.softRemove(record);
  }
}
