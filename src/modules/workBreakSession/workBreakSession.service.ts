import { Injectable, NotFoundException } from "@nestjs/common";
import { DeepPartial, Between } from "typeorm";
import { WorkBreakSession } from "./workBreakSession.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { CreateWorkBreakSessionDto } from "./dtos/create-workBreakSession.dto";
import { commonFunctions } from "helper";
import moment from "moment-timezone";
@Injectable()
export class WorkBreakSessionService {
  async isExist(query: any, schema: string) {
    const { repo } = await getRepositoryForCompany<WorkBreakSession>(
      WorkBreakSession,
      schema
    );
    return await repo.findOne({ where: query });
  }

  async create(createDto: CreateWorkBreakSessionDto, schema: string) {
    const { repo } = await getRepositoryForCompany<WorkBreakSession>(
      WorkBreakSession,
      schema
    );
    const entity = repo.create(createDto as DeepPartial<WorkBreakSession>);
    return await repo.save(entity);
  }

  async getAll(query: any, schema: string) {
    let { appendIfValid } = commonFunctions;
    let { timeZone } = query;
    const { repo } = await getRepositoryForCompany<WorkBreakSession>(
      WorkBreakSession,
      schema
    );
    let whereCondition: any = {
      organizationId: query.organizationId,
      ...appendIfValid("userId", query.userId),
    };
    if (query.date) {
      const startDate = moment.tz(query.date, timeZone).startOf("day").toDate();
      const endDate = moment.tz(query.date, timeZone).endOf("day").toDate();
      whereCondition["breakStartTime"] = Between(startDate, endDate);
    }
    return await repo.find({
      where: whereCondition,
      order: { createdDate: "DESC" },
    });
  }

  async getById(id: string, schema: string): Promise<WorkBreakSession> {
    const { repo } = await getRepositoryForCompany<WorkBreakSession>(
      WorkBreakSession,
      schema
    );
    const record = await repo.findOne({
      where: { workBreakSessionId: id },
    });
    if (!record)
      throw new NotFoundException(`WorkBreakSession ${id} not found`);
    return record;
  }
  async update(id: string, updateDto: any, schema: string) {
    const { repo } = await getRepositoryForCompany<WorkBreakSession>(
      WorkBreakSession,
      schema
    );
    const record = await this.getById(id, schema);
    Object.assign(record, updateDto);
    return await repo.save(record);
  }

  async delete(id: string, schema: string) {
    const { repo } = await getRepositoryForCompany<WorkBreakSession>(
      WorkBreakSession,
      schema
    );
    const record = await this.getById(id, schema);
    return await repo.softRemove(record);
  }
}
