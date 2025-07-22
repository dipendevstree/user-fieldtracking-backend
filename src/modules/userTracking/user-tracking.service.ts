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
import { SocketGateway } from "../socket/socket.gateway";

@Injectable()
export class UserTrackingService {
  private readonly baseModelName = "UserTracking";

  constructor(
    private readonly modelUtil: GetModelForCompany,
    private readonly redisService: RedisService,
    private readonly socketGateway: SocketGateway
  ) {}

  private getModel(tenantId: string): Model<UserTracking> {
    return this.modelUtil.getModelForTenant<UserTracking>(
      this.baseModelName,
      UserTrackingSchema,
      tenantId
    );
  }

  private handleRedisAndSocketAsync(records: any[]) {
    for (let i = 0; i < records.length; i++) {
      const record = records[i].toObject();
      console.log("handleRedisAndSocketAsyncRecord", record);
      const redisKey = `user_tracking:${record.userId}:${record.workDaySessionId}`;
      // Emit live location
      this.socketGateway.emitLiveLocation(record);
      // Fire-and-forget Redis operations
      void Promise.all([
        this.redisService.lpush(redisKey, record),
        this.redisService.expire(redisKey, 86400),
      ]).catch((err) => {
        // Optional: Log error if Redis fails
        console.error(`Redis error for key ${redisKey}:`, err);
      });
    }
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

    console.log("singleCreate", userTracking.toObject());
    // Call socket
    this.socketGateway.emitLiveLocation(userTracking.toObject());

    // Push to Redis
    const redisKey = `user_tracking:${userTracking.userId}:${userTracking.workDaySessionId}`;
    this.redisService.lpush(redisKey, userTracking);
    this.redisService.expire(redisKey, 86400);

    return userTracking;
  }

  async createMultiple(dtos: any, tenantId: string): Promise<UserTracking[]> {
    const model = this.getModel(tenantId);
    const insertedRecords: any = await model.insertMany(dtos);

    // Run Redis and socket tasks in background
    this.handleRedisAndSocketAsync(insertedRecords);
    return insertedRecords;
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
    if (withFullAddress && latestEntry) {
      const address = await commonFunctions.getFullAddressByLatLong(
        latestEntry.lat,
        latestEntry.long
      );
      latestEntry["fullAddress"] = address;
    }
    return latestEntry;
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
    return await model.find(whereCondition).sort({ createdAt: 1 });
  }

  async deleteAll(tenantId: string): Promise<{ deletedCount?: number }> {
    const model = this.getModel(tenantId);
    return await model.deleteMany({});
  }
}
