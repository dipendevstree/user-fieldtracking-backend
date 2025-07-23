import { forwardRef, Inject, Injectable } from "@nestjs/common";
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
  private async pushToRedis(insertedRecords: any): Promise<void> {
    for (const record of insertedRecords) {
      let userTracking = record.toObject();
      console.log("userTracking", userTracking);
      this.socketGateway.emitLiveLocation(userTracking);
      const redisKey = `user_tracking:${record.userId}:${record.workDaySessionId}`;
      await this.redisService.lpush(redisKey, userTracking); // Optional: JSON.stringify(userTracking)
      await this.redisService.expire(redisKey, 86400); // 1 day = 86400 seconds
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
    // Push to Redis
    console.log("createUserTracking", userTracking);
    const redisKey = `user_tracking:${userTracking.userId}:${userTracking.workDaySessionId}`;
    await this.redisService.lpush(redisKey, userTracking); // Optional: JSON.stringify(userTracking)
    await this.redisService.expire(redisKey, 86400); // 1 day = 86400 seconds
    return userTracking;
  }

  async createMultiple(dtos: any, tenantId: string): Promise<UserTracking[]> {
    const model = this.getModel(tenantId);
    const insertedRecords: any = await model.insertMany(dtos);

    // Run Redis and socket tasks in background
    this.pushToRedis(insertedRecords);
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
