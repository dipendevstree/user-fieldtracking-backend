import { Injectable } from "@nestjs/common";
import { ILike, Between } from "typeorm";
import { Visit } from "./visit.entity";
import { getRepositoryForCompany } from "src/middleware/dynamic-schema.service";
import { commonFunctions } from "helper";
import moment from "moment-timezone";
import { VISIT_STATUS } from "helper/constants";
@Injectable()
export class VisitService {
  async isExist(query: any, schema: string): Promise<Visit | undefined> {
    const { repo } = await getRepositoryForCompany<Visit>(Visit, schema);
    return await repo.findOne({ where: query });
  }

  async create(createMultiVisitDto: any, schema: string): Promise<Visit> {
    const { repo } = await getRepositoryForCompany<Visit>(Visit, schema);
    const {
      salesRepresentativeUserId,
      date,
      visits,
      createdBy,
      organizationId,
      status,
    } = createMultiVisitDto;
    const visitEntities = visits.map((visit) => {
      return repo.create({
        ...visit,
        date: moment(date, "DD-MM-YYYY").toISOString(),
        createdBy,
        organizationId,
        status,
        salesRepresentativeUserId,
      });
    });

    return await repo.save(visitEntities);
  }

  async getAll(
    query: any,
    schema: string
  ): Promise<{
    totalCount: number;
    totalPages: number;
    currentPage: number;
    list: Visit[];
  }> {
    let { appendIfValid } = commonFunctions;
    let { timeZone } = query;
    const { repo } = await getRepositoryForCompany<Visit>(Visit, schema);
    const hasPagination = !!(query.page && query.limit);
    const page = hasPagination ? parseInt(query.page, 10) : 1;
    const limit = hasPagination ? parseInt(query.limit, 10) : 10;
    const offset = (page - 1) * limit;
    const sortField = query.sortField ?? "createdDate";
    const sortDirection =
      query.sort && query.sort.toLowerCase() === "asc" ? "ASC" : "DESC";
    const whereCondition: Record<string, any> = {
      organizationId: query.organizationId,
      ...appendIfValid("customerId", query.customerId),
      ...appendIfValid("status", query.status),
      ...appendIfValid("priority", query.priority),
      ...appendIfValid(
        "salesRepresentativeUserId",
        query.salesRepresentativeUserId
      ),
      ...appendIfValid("customerContactId", query.customerContactId),
    };

    if (query.searchFor && query.searchFor.trim() !== "") {
      whereCondition["purpose"] = ILike(`%${query.searchFor}%`);
    }
    if (
      query.startDate &&
      query.startDate != "" &&
      query.endDate &&
      query.endDate != ""
    ) {
      const startDate = moment
        .tz(query.startDate, timeZone)
        .startOf("day")
        .toDate();
      const endDate = moment.tz(query.endDate, timeZone).endOf("day").toDate();
      whereCondition["date"] = Between(startDate, endDate);
    }

    let list: Visit[];
    let totalCount: number;

    if (hasPagination) {
      [list, totalCount] = await repo.findAndCount({
        where: whereCondition,
        order: { [sortField]: sortDirection },
        relations: ["salesRepresentativeUser", "customer", "customerContact"],
        skip: offset,
        take: limit,
      });
    } else {
      list = await repo.find({
        where: whereCondition,
        order: { [sortField]: sortDirection },
      });
      totalCount = list.length;
    }

    return {
      totalCount,
      totalPages: hasPagination ? Math.ceil(totalCount / limit) : 1,
      currentPage: page,
      list,
    };
  }

  async getById(id: string, schema: string): Promise<Visit> {
    const { repo } = await getRepositoryForCompany<Visit>(Visit, schema);
    return await repo.findOneOrFail({ where: { visitId: id } });
  }

  async update(payload: Visit, schema: string): Promise<Visit> {
    const { repo } = await getRepositoryForCompany<Visit>(Visit, schema);
    return await repo.save(payload);
  }

  async delete(id: string, schema: string): Promise<Visit> {
    const { repo } = await getRepositoryForCompany<Visit>(Visit, schema);
    const entity = await this.getById(id, schema);
    return await repo.softRemove(entity);
  }

  async getVisitAnalytics(query: any, schema: string) {
    let { appendIfValid } = commonFunctions;
    let { timeZone } = query;
    const { repo } = await getRepositoryForCompany<Visit>(Visit, schema);

    let whereCondition: any = {
      organizationId: query.organizationId,
      ...appendIfValid(
        "salesRepresentativeUserId",
        query.salesRepresentativeUserId
      ),
    };

    if (query.startDate && query.endDate) {
      const startDate = moment
        .tz(query.startDate, timeZone)
        .startOf("day")
        .toDate();
      const endDate = moment.tz(query.endDate, timeZone).endOf("day").toDate();
      whereCondition["date"] = Between(startDate, endDate);
    }

    // Build dynamic query using QueryBuilder
    const qb = repo
      .createQueryBuilder("visit")
      .select("visit.status", "status")
      .addSelect("COUNT(*)", "count")
      .where(whereCondition)
      .groupBy("visit.status");

    const results = await qb.getRawMany();
    console.log("results", results);

    // Initialize default status counts
    const statusCounts = {
      [VISIT_STATUS.PENDING]: 0,
      [VISIT_STATUS.COMPLETED]: 0,
      [VISIT_STATUS.CANCEL]: 0,
      [VISIT_STATUS.CHECKIN]: 0,
      [VISIT_STATUS.PARTIAL_COMPLETED]: 0,
      totalVisits: 0,
    };

    // Populate actual counts
    results.forEach((row) => {
      statusCounts[row.status] = parseInt(row.count, 10);
    });

    // Calculate total visits
    statusCounts.totalVisits = Object.values(statusCounts).reduce(
      (sum, val) => sum + val,
      0
    );

    return {
      statusCounts,
    };
  }
}
