import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Req,
  UseGuards,
  Res,
} from "@nestjs/common";
import { UserTrackingService } from "./user-tracking.service";
import { CreateUserTrackingDto } from "./dtos/create-user-tracking.dto";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/modules/auth/jwt-auth.guard";
import { RolesGuard } from "src/modules/auth/role-auth-guard";
import { commonResponse } from "helper";
import { CreateMultipleUserTrackingDto } from "./dtos/create-multiple-user-tracking.dto";
import moment from "moment-timezone";
@ApiTags("UserTracking")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("user-tracking")
export class UserTrackingController {
  constructor(private readonly userTrackingService: UserTrackingService) {}

  @Post("/create")
  async create(
    @Req() req,
    @Res() res: Response,
    @Body() dto: CreateUserTrackingDto,
  ) {
    const schemaName = req.user.schemaName;
    dto["userId"] = req.user.id;
    dto["organizationId"] = req.user.organizationID;
    let result = await this.userTrackingService.create(dto, schemaName);
    return commonResponse.success(
      "en",
      res,
      "USER_TRACKING_CREATED_SUCCESS",
      201,
      result,
    );
  }

  // @Post("/create-multiple")
  // async createMultiple(
  //   @Req() req,
  //   @Res() res: Response,
  //   @Body() body: CreateMultipleUserTrackingDto
  // ) {
  //   const schemaName = req.user.schemaName;
  //   let { location, workDaySessionId, date } = body;
  //   let latLongArray = [];
  //   if (location?.length > 0) {
  //     for (let index = 0; index < location.length; index++) {
  //       const element = location[index];
  //       const latitude = element?.coords?.latitude;
  //       const longitude = element?.coords?.longitude;
  //       if (latitude != null && longitude != null) {
  //         if (latitude == 37.4219983 && longitude == -122.084) {
  //           continue;
  //         } else {
  //           latLongArray.push({
  //             workDaySessionId: workDaySessionId,
  //             userId: req.user.id,
  //             organizationId: req.user.organizationID,
  //             speed: element?.coords?.speed,
  //             date: moment.utc(date, "DD-MM-YYYY").startOf("day").toDate(),
  //             lat: latitude,
  //             long: longitude,
  //           });
  //         }
  //       } else {
  //         console.log("Invalid coordinates in element:", element);
  //       }
  //     }
  //   } else if (location?.coords) {
  //     const latitude = location?.coords?.latitude;
  //     const longitude = location?.coords?.longitude;
  //     if (latitude != null && longitude != null) {
  //       if (latitude == 37.4219983 && longitude == -122.084) {
  //         return;
  //       } else {
  //         latLongArray.push({
  //           workDaySessionId: workDaySessionId,
  //           userId: req.user.id,
  //           organizationId: req.user.organizationID,
  //           speed: location?.coords?.speed,
  //           date: moment.utc(date, "DD-MM-YYYY").startOf("day").toDate(),
  //           lat: latitude,
  //           long: longitude,
  //         });
  //       }
  //     } else {
  //       console.log("Invalid single location:", location);
  //     }
  //   }
  //   const result = await this.userTrackingService.createMultiple(
  //     latLongArray,
  //     schemaName,
  //     date
  //   );
  //   return commonResponse.success(
  //     "en",
  //     res,
  //     "USER_TRACKING_MULTIPLE_CREATED_SUCCESS",
  //     201,
  //     result
  //   );
  // }

  // 1. Haversine Formula for Server-Side Validation
  getDistanceInKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 2. Velocity Check (Speed = Distance / Time)
  isPlausibleSpeed = (point1: any, point2: any, maxKmH = 250) => {
    const distance = this.getDistanceInKm(
      point1.lat,
      point1.long,
      point2.lat,
      point2.long,
    );
    const timeDiffHours =
      Math.abs(
        new Date(point2.timestamp).getTime() -
          new Date(point1.timestamp).getTime(),
      ) / 3600000;
    if (timeDiffHours === 0) return true; // Avoid division by zero
    const speed = distance / timeDiffHours;
    return speed <= maxKmH; // Returns false if speed > 250 km/h (a GPS drift jump)
  };

  // 3. Douglas-Peucker Algorithm (Removes zig-zag micro-drift from routes)
  perpendicularDistance = (point: any, lineStart: any, lineEnd: any) => {
    let dx = lineEnd.long - lineStart.long;
    let dy = lineEnd.lat - lineStart.lat;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag > 0.0) {
      dx /= mag;
      dy /= mag;
    }
    const pvx = point.long - lineStart.long;
    const pvy = point.lat - lineStart.lat;
    const pvdot = dx * pvx + dy * pvy;
    const ax = pvx - pvdot * dx;
    const ay = pvy - pvdot * dy;
    return Math.sqrt(ax * ax + ay * ay);
  };

  douglasPeucker = (points: any[], epsilon: number): any[] => {
    if (points.length <= 2) return points;
    let maxDistance = 0;
    let index = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const distance = this.perpendicularDistance(
        points[i],
        points[0],
        points[points.length - 1],
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }
    if (maxDistance > epsilon) {
      const left = this.douglasPeucker(points.slice(0, index + 1), epsilon);
      const right = this.douglasPeucker(points.slice(index), epsilon);
      return left.slice(0, left.length - 1).concat(right);
    } else {
      return [points[0], points[points.length - 1]];
    }
  };

  @Post("/create-multiple")
  async createMultiple(
    @Req() req,
    @Res() res: Response,
    @Body() body: CreateMultipleUserTrackingDto,
  ) {
    const schemaName = req.user.schemaName;
    let { location, workDaySessionId, date } = body;
    console.log(
      "🚀 🚀  ~~~~ user-tracking.controller.ts:200 ~~~~ UserTrackingController ~~~~ location🚀 🚀 :",
      location.length,
    );

    // Normalize payload to an array format
    let rawLocations = [];

    if (Array.isArray(location)) {
      rawLocations = location;
    } else if (location && location.coords) {
      rawLocations = [location];
    }

    // Phase 1: Extract and Filter Bad Accuracy & Simulator Data
    let preFilteredPoints = [];

    for (let i = 0; i < rawLocations.length; i++) {
      const loc = rawLocations[i];
      console.log(
        "🚀 🚀  ~~~~ user-tracking.controller.ts:219 ~~~~ UserTrackingController ~~~~ loc🚀 🚀 :",
        loc,
      );

      const coords = loc?.coords;

      if (coords?.latitude != null && coords?.longitude != null) {
        // Reject Google Simulator
        if (coords.latitude == 37.4219983 && coords.longitude == -122.084)
          continue;

        // REJECT: Terrible accuracy (Multipath train box error)
        if (coords.accuracy > 150) {
          console.log(
            `[GPS Shield] Dropped point due to low accuracy: ${coords.accuracy}m`,
          );
          continue;
        }

        preFilteredPoints.push({
          lat: coords.latitude,
          long: coords.longitude,
          speed: coords.speed,
          accuracy: coords.accuracy,
          timestamp: loc.timestamp || new Date().toISOString(), // Use plugin timestamp
        });
      }
    }

    // Phase 2: Velocity Check (Remove impossible jumps)
    // Ensure chronologically sorted first
    preFilteredPoints.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    let validPathPoints = [];
    let lastValidPoint = null;

    for (let i = 0; i < preFilteredPoints.length; i++) {
      const currentPoint = preFilteredPoints[i];

      if (!lastValidPoint) {
        validPathPoints.push(currentPoint);
        lastValidPoint = currentPoint;
      } else {
        // Check if speed between last known point and current point is physically possible (<250 km/h)
        if (this.isPlausibleSpeed(lastValidPoint, currentPoint, 250)) {
          validPathPoints.push(currentPoint);
          lastValidPoint = currentPoint;
        } else {
          console.log(
            `[GPS Shield] Dropped multipath jump (Speed exceeded 250km/h)`,
          );
        }
      }
    }

    // Phase 3: Path Simplification (Douglas-Peucker)
    // Removes stationary micro-jitter. Epsilon 0.0001 is approx 11 meters tolerance.
    let finalSmoothedPoints =
      validPathPoints.length > 2
        ? this.douglasPeucker(validPathPoints, 0.0001)
        : validPathPoints;

    // Final Mapping to Database Schema format
    let latLongArray = finalSmoothedPoints.map((point) => ({
      workDaySessionId: workDaySessionId,
      userId: req.user.id,
      organizationId: req.user.organizationID,
      speed: point.speed,
      date: moment.utc(date, "DD-MM-YYYY").startOf("day").toDate(),
      lat: point.lat,
      long: point.long,
    }));
    console.log(
      "🚀 🚀  ~~~~ user-tracking.controller.ts:293 ~~~~ UserTrackingController ~~~~ latLongArray🚀 🚀 :",
      latLongArray.length,
    );

    if (latLongArray.length === 0) {
      // If all points were garbage, simply return success without saving bad data
      return commonResponse.success(
        "en",
        res,
        "USER_TRACKING_FILTERED_ALL_POINTS",
        201,
        [],
      );
    }

    console.log(
      "🚀 🚀  ~~~~ user-tracking.controller.ts:292 ~~~~ UserTrackingController ~~~~ latLongArray.length🚀 🚀 :",
      latLongArray.length,
    );
    // DB Insert
    const result = await this.userTrackingService.createMultiple(
      latLongArray,
      schemaName,
      date,
    );

    return commonResponse.success(
      "en",
      res,
      "USER_TRACKING_MULTIPLE_CREATED_SUCCESS",
      201,
      result,
    );
  }

  @Get("last-lot-long/:userId")
  @ApiQuery({
    name: "withFullAddress",
    required: false,
    type: Boolean,
    example: true,
    description:
      "Whether to include latitude and longitude data in the response",
  })
  @ApiQuery({
    name: "timeZone",
    required: false,
    type: String,
    description: "timeZone",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    example: "2025-01-31",
    description: "Visit end date",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    example: "2025-01-01",
    description: "Visit start date",
  })
  async lastLangLong(
    @Param("userId") userId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      const tenantId = req.user?.schemaName;
      console.log("userId", userId);
      req.query["organizationId"] = req.user.organizationID;
      req.query["timeZone"] = req.user.timeZone;
      req.query["userId"] = userId;

      let result = await this.userTrackingService.getSingleEntryByQuery(
        req.query,
        tenantId,
      );

      return commonResponse.success(
        "en",
        res,
        "USER_TRACKING_DETAILS",
        201,
        result,
      );
    } catch (error) {
      console.log("errorerrorerror", error);
    }
  }

  @Get("/list")
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    example: "2025-01-31",
    description: "End date",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    example: "2025-01-01",
    description: "Start date",
  })
  @ApiQuery({
    name: "workDaySessionId",
    required: false,
    type: String,
    example: "uuid",
    description: "Filer by workDaySessionId",
  })
  async findAll(@Req() req, @Res() res: Response) {
    const tenantId = req.user?.schemaName;
    req.query["organizationId"] = req.user.organizationID;
    req.query["timeZone"] = req.user.timeZone;
    req.query["userId"] = req.user.id;
    let result = await this.userTrackingService.findAll(tenantId, req.query);
    return commonResponse.success(
      "en",
      res,
      "USER_TRACKING_LIST_SUCCESS",
      201,
      result,
    );
  }

  @Get("user/:userId")
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    example: "2025-01-01",
    description: "Start date",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    example: "2025-01-31",
    description: "End date",
  })
  @ApiQuery({
    name: "workDaySessionId",
    required: false,
    type: String,
    example: "uuid",
    description: "Filer by workDaySessionId",
  })
  async findByUserId(@Param("userId") userId: string, @Req() req) {
    console.log("findByUserId", userId);
    const tenantId = req.user?.schemaName;
    req.query["organizationId"] = req.user.organizationID;
    req.query["timeZone"] = req.user.timeZone;
    req.query["userId"] = userId;
    return this.userTrackingService.findAll(tenantId, req.query);
  }

  @Delete()
  async deleteAll(@Req() req) {
    const tenantId = req.user?.schemaName;
    return this.userTrackingService.deleteAll(tenantId);
  }
}
