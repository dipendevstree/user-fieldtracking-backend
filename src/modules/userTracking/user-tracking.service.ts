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
import { RedisService } from "../redis/redis.service";

@Injectable()
export class UserTrackingService {
  private readonly baseModelName = "UserTracking";

  constructor(
    private readonly modelUtil: GetModelForCompany,
    private readonly redisService: RedisService
  ) {}

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
  ): Promise<UserTracking | null> {
    const model = this.getModel(tenantId);
    const formattedDate = moment
      .utc(dto.date, "DD-MM-YYYY")
      .startOf("day")
      .toDate();
    // Save to DB
    const userTracking = await model.create({ ...dto, date: formattedDate });
    if (!userTracking) return null;
    // Push to Redis
    const redisKey = `user_tracking:${userTracking.userId}:${userTracking.workDaySessionId}`;
    await this.redisService.lpush(redisKey, userTracking); // Optional: JSON.stringify(userTracking)
    await this.redisService.expire(redisKey, 86400); // 1 day = 86400 seconds
    return userTracking;
  }

  async getSingleEntryByQuery(query: any, tenantId: string) {
    const model = this.getModel(tenantId);
    let { userId, withFullAddress } = query;
    console.log("userId", userId);
    const whereCondition: any = {
      ...commonFunctions.appendIfValid("userId", userId),
    };

    let latestEntry = await model
      .findOne(whereCondition)
      .sort({ createdAt: -1 })
      .lean();
    console.log("latestEntry", latestEntry, withFullAddress);
    if (withFullAddress && latestEntry) {
      const address = await commonFunctions.getFullAddressByLatLong(
        latestEntry.lat,
        latestEntry.long
      );
      console.log("address", address);
      latestEntry["fullAddress"] = address;
    }
    console.log("latestEntry", latestEntry);
    return latestEntry;
  }

  async createMultiple(
    dtos: CreateUserTrackingDto[],
    tenantId: string,
    userId: string,
    organizationId: string
  ): Promise<UserTracking[]> {
    const model = this.getModel(tenantId);

    // Inject userId, organizationId, and format date in one map
    const formattedDtos = dtos.map((dto) => ({
      ...dto,
      userId,
      organizationId,
      date: moment.utc(dto.date, "DD-MM-YYYY").startOf("day").toDate(), // 👈 Ensures 00:00:00 UTC
    }));

    const insertedRecords = await model.insertMany(formattedDtos);

    // Redis push (parallel)
    Promise.all(
      insertedRecords.map((record) => {
        const redisKey = `user_tracking:${record.userId}:${record.workDaySessionId}`;
        return Promise.all([
          this.redisService.lpush(redisKey, record),
          this.redisService.expire(redisKey, 86400),
        ]);
      })
    );

    return insertedRecords;
  }

  async findAll(tenantId: string, query: any): Promise<UserTracking[]> {
    const {
      timeZone,
      workDaySessionId,
      userId,
      organizationId,
      startDate,
      endDate,
    } = query;
    const redisKey = workDaySessionId
      ? `user_tracking:${userId}:${workDaySessionId}`
      : null;
    console.log("redisKey", redisKey);
    // Try Redis if session ID is available
    if (redisKey) {
      const redisData = await this.redisService.lrange(redisKey, 0, -1);
      if (redisData?.length) return redisData;
    }
    // Fallback to DB
    const model = this.getModel(tenantId);
    const whereCondition: any = {
      organizationId,
      ...commonFunctions.appendIfValid("workDaySessionId", workDaySessionId),
      ...commonFunctions.appendIfValid("userId", userId),
    };
    if (startDate && endDate) {
      whereCondition.date = {
        $gte: moment.tz(startDate, timeZone).startOf("day").toDate(),
        $lte: moment.tz(endDate, timeZone).endOf("day").toDate(),
      };
    }
    return await model.find(whereCondition).sort({ createdAt: -1 });
  }

  async deleteAll(tenantId: string): Promise<{ deletedCount?: number }> {
    const model = this.getModel(tenantId);
    return await model.deleteMany({});
  }
}
