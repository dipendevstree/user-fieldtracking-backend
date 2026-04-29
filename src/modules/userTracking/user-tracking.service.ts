import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Model, RootFilterQuery, Types } from "mongoose";
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
import { APPLY_TRACKING_FILTER } from "helper/constants";

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
    if (!insertedRecords?.length) return;

    let [firstData, ...otherData] = insertedRecords;

    let firstUserTrackingData = firstData.toObject();
    const redisKey = `user_tracking:${firstData.userId}:${date}`;
    let redisListLenth = await this.redisService.lpush(redisKey, firstUserTrackingData); // Optional: JSON.stringify(userTracking)
    
    // if redis list length is 1 then emit first record to socket and filters other records and emit
    if (redisListLenth === 1) {
      this.socketGateway.emitLiveLocation(firstUserTrackingData);
    } else {
      // ignoreFirstAndLast = true → skips the isFirst/isLast check, only applies activity+speed filter
      if (!APPLY_TRACKING_FILTER || this.liveTrackingFilter(firstUserTrackingData, 0, [firstUserTrackingData], true)) {
        this.socketGateway.emitLiveLocation(firstUserTrackingData);
      }
    }

    if (otherData.length > 0) {
      // filters other records and emit
      await this.emitLocationWithFiltersInRedis(otherData, redisKey);
      await this.redisService.expire(redisKey, 86400); // 1 day = 86400 seconds
    }
  }

  private async emitLocationWithFiltersInRedis(data: any, redisKey: string) {
    let redisData = data.map(record => record.toObject());
    // Push all record to redis
    for (const record of redisData) {
      await this.redisService.lpush(redisKey, record);
    }
    // filters other records and to be emitted
    if (APPLY_TRACKING_FILTER) {
      redisData = redisData.filter((record, index) => this.liveTrackingFilter(record, index, redisData, true));
    }
    if (redisData.length > 0) {
      for (const record of redisData) {
        this.socketGateway.emitLiveLocation(record);
      }
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
    this.pushToRedis(insertedRecords, date).catch((err) =>
      console.error('Redis pushToRedis failed (non-critical):', err)
    );
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
      .findOne({
        ...whereCondition,
        // ...(APPLY_TRACKING_FILTER ? this.filterCondition() : {}) // uncomment this if you want valid records only
      })
      .sort({ date: -1 })
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
      if (redisKey && startDate) {
        const redisData = await this.redisService.lrange(redisKey, 0, -1);
        if (redisData?.length) {
          if (!APPLY_TRACKING_FILTER) return redisData;
          return redisData.filter((record, index) => this.liveTrackingFilter(record, index, redisData));
          // If the frontend remove reverse then add (uncomment below line) reverse function in this redisData.filter also as well as from DB also
          // return redisData.reverse();
        }
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

      // Fetch first and last record
      const firstRecord = APPLY_TRACKING_FILTER && await model.findOne(whereCondition).sort({ date: 1 }).select("_id");
      const lastRecord = APPLY_TRACKING_FILTER && await model.findOne(whereCondition).sort({ date: -1 }).select("_id");

      // Fetch all records sorted ASC to identify first and last points
      const allRecords = await model.find({
        ...whereCondition,
        ...(APPLY_TRACKING_FILTER ? this.filterCondition([firstRecord?._id, lastRecord?._id].filter(Boolean)) : {})
      }).sort({ date: 1 });

      // Placeholder - you can store the calculated data in redis as per {redisKey} filtered date. so in future db call could be avoid.
      // Placeholder - end.

      // If the frontend remove reverse then remove this reverse as well as from redis also
      return allRecords.reverse();
    } catch (error) {
      console.log("errrrrorrr", error);
    }
  }

  // condition for filter lat long DB level
  filterCondition(boundaryIds?: Types.ObjectId[]) {
    // If this conditions changes then change in liveTrackingFilter function also
    const orWhere: RootFilterQuery<UserTracking>[] = [
      // Speed <= 20 (upper cap) AND (speed >= 3 OR (still AND speed >= 2))
      {
        "locationRawData.coords.speed": { $lte: 20 },
        $or: [
          { "locationRawData.coords.speed": { $gte: 3 } },
          {
            $and: [
              { "locationRawData.activity.type": "still" },
              { "locationRawData.coords.speed": { $gte: 2 } }
            ]
          }
        ]
      }
    ];
    if (boundaryIds?.length > 0) {
      // Always include first and last
      orWhere.push({ _id: { $in: boundaryIds } })
    }
    return {
      $or: orWhere
    };
  }

  // condition for filter lat long app/JS level
  liveTrackingFilter(location: UserTracking, index: number, allRecords: UserTracking[], ignoreFirstAndLast?: boolean) {
    // If this conditions changes then change in filterCondition function also
    const isFirst = index === 0;
    const isLast = index === allRecords.length - 1;

    if (!ignoreFirstAndLast && (isFirst || isLast)) return true; // Always include first and last points

    const speed = location?.locationRawData?.coords?.speed;
    const activityType = location?.locationRawData?.activity?.type;

    if (speed == null) return false;

    // Speed must be <= 20 (upper cap to filter GPS jumps)
    if (speed > 20) return false;

    // Include if speed >= 3 (significant movement)
    if (speed >= 3) return true;

    // Include if activity is "still" AND speed >= 2
    if (activityType === "still" && speed >= 2) return true;

    return false;
  }
}
