import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { CreateUserTrackingDto } from "./dtos/create-user-tracking.dto";
import {
  UserTracking,
  UserTrackingSchema,
} from "./schemas/user-tracking.schema";
import { GetModelForCompany } from "src/middleware/dynamic-model.service";
import { commonFunctions } from "helper";
import moment from "moment-timezone";

@Injectable()
export class UserTrackingService {
  private readonly baseModelName = "UserTracking";

  constructor(private readonly modelUtil: GetModelForCompany) {}

  private getModel(tenantId: string): Model<UserTracking> {
    return this.modelUtil.getModelForTenant<UserTracking>(
      this.baseModelName,
      UserTrackingSchema,
      tenantId
    );
  }

  async create(
    dto: CreateUserTrackingDto,
    tenantId: string
  ): Promise<UserTracking> {
    dto["date"] = moment(dto.date, "DD-MM-YYYY").toISOString();
    const model = this.getModel(tenantId);
    let response = await model.create(dto);
    console.log("response", response);
    return response;
  }

  async findAll(tenantId: string, query: any): Promise<UserTracking[]> {
    let { timeZone } = query;
    let { appendIfValid } = commonFunctions;
    const model = this.getModel(tenantId);
    const whereCondition: any = {
      organizationId: query.organizationId,
      ...appendIfValid("visitId", query.visitId),
      ...appendIfValid("userId", query.userId),
    };
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
      whereCondition["date"] = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    return await model.find(whereCondition).sort({ created_at: -1 });
  }

  async deleteAll(tenantId: string): Promise<{ deletedCount?: number }> {
    const model = this.getModel(tenantId);
    return await model.deleteMany({});
  }
}
