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
  private async pushToRedis(insertedRecords: any, date: string): Promise<void> {
    for (const record of insertedRecords) {
      let userTracking = record.toObject();
      this.socketGateway.emitLiveLocation(userTracking);
      const redisKey = `user_tracking:${record.userId}:${date}`;
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
    const redisKey = `user_tracking:${userTracking.userId}:${dto.date}`;
    await this.redisService.lpush(redisKey, userTracking); // Optional: JSON.stringify(userTracking)
    await this.redisService.expire(redisKey, 86400); // 1 day = 86400 seconds
    return userTracking;
  }

  async createMultiple(
    dtos: any,
    tenantId: string,
    date: string
  ): Promise<UserTracking[]> {
    const model = this.getModel(tenantId);
    const insertedRecords: any = await model.insertMany(dtos);
    // Run Redis and socket tasks in background
    this.pushToRedis(insertedRecords, date);
    return insertedRecords;
  }

  async getSingleEntryByQuery(query: any, tenantId: string) {
    const model = this.getModel(tenantId);
    let { userId, withFullAddress, timeZone, startDate, endDate } = query;
    const whereCondition: any = {
      ...commonFunctions.appendIfValid("userId", userId),
    };
    if (startDate && endDate) {
      whereCondition.date = {
        $gte: moment.tz(startDate, timeZone).startOf("day").toDate(),
        $lte: moment.tz(endDate, timeZone).endOf("day").toDate(),
      };
    }
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
    try {
      const {
        timeZone,
        workDaySessionId,
        userId,
        organizationId,
        startDate,
        endDate,
      } = query;
      let startDateFormatted = moment
        .tz(startDate, timeZone)
        .format("DD-MM-YYYY");
      let endDateFormatted = moment.tz(endDate, timeZone).format("DD-MM-YYYY");

      const redisKey =
        startDateFormatted == endDateFormatted
          ? `user_tracking:${userId}:${startDateFormatted}`
          : null;
      // Try Redis if session ID is available
      // if (redisKey && startDate) {
      //   const redisData = await this.redisService.lrange(redisKey, 0, -1);
      //   if (redisData?.length) return redisData;
      // }
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

      // Fetch all records sorted ASC to identify first and last points
      const allRecords = await model.find(whereCondition).sort({ date: 1 });

      const filteredRecords = allRecords.filter((record, index) => {
        const isFirst = index === 0;
        const isLast = index === allRecords.length - 1;

        if (isFirst || isLast) return true; // Always include first and last points

        const isNotStill = record?.locationRawData?.activity?.type !== "still";
        const isSignificantMove = parseInt(record?.speed) > 0;

        return isNotStill && isSignificantMove; // Exclude still points and points with speed 0
      });

      return filteredRecords.reverse();
    } catch (error) {
      console.log("errrrrorrr", error);
    }
  }

  async deleteAll(tenantId: string): Promise<{ deletedCount?: number }> {
    const model = this.getModel(tenantId);
    return await model.deleteMany({});
  }
}
