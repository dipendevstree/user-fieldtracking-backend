import { Body, Controller, Delete, Get, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/modules/auth/jwt-auth.guard";
import { RolesGuard } from "src/modules/auth/role-auth-guard";
import { UserTrackingService } from "./user-tracking.service";
import { CreateMultipleUserTrackingDto } from "./dtos/create-multiple-user-tracking.dto";
import { commonResponse } from "helper";

@ApiTags("UserTracking")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: "user-tracking", version: "2" })
export class UserTrackingControllerV2 {
  constructor(private readonly userTrackingService: UserTrackingService) {}

  // New Method but not using lat long filters (Current latest function as per timestamp column changes)
  @Post("/create-multiple")
  async createMultiple(
    @Req() req,
    @Res() res: Response,
    @Body() body: CreateMultipleUserTrackingDto
  ) {
    const schemaName = req.user.schemaName;
    let { location, workDaySessionId, date } = body;
    console.log("==================================Live Tracking Debug(Start)==============================================");
    console.log("=> Location: ", Array.isArray(location) ? "Location length: " + location.length : "Location Object: " + JSON.stringify(location), "Raw Location Object From App:", location)
    let latLongArray = [];
    if (location?.length > 0) {
      for (let index = 0; index < location.length; index++) {
        const element = location[index];
        const latitude = element?.coords?.latitude;
        const longitude = element?.coords?.longitude;
        if (latitude != null && longitude != null) {
          if (latitude == 37.4219983 && longitude == -122.084) {
            continue;
          } else {
            latLongArray.push({
              workDaySessionId: workDaySessionId,
              userId: req.user.id,
              organizationId: req.user.organizationID,
              speed: element?.coords?.speed,
              date: element.timestamp,
              lat: latitude,
              long: longitude,
            });
          }
        } else {
          console.log("Invalid coordinates in element:", element);
        }
      }
    } else if (location?.coords) {
      const latitude = location?.coords?.latitude;
      const longitude = location?.coords?.longitude;
      if (latitude != null && longitude != null) {
        if (latitude == 37.4219983 && longitude == -122.084) {
          return;
        } else {
          latLongArray.push({
            workDaySessionId: workDaySessionId,
            userId: req.user.id,
            organizationId: req.user.organizationID,
            speed: location?.coords?.speed,
            date: location.timestamp,
            lat: latitude,
            long: longitude,
          });
        }
      } else {
        console.log("Invalid single location:", location);
      }
    }
    const result = await this.userTrackingService.createMultiple(
      latLongArray,
      schemaName,
      date
    );
    console.log("=> Data Inserted Into Database. Total Records: ", latLongArray.length);
    console.log("==================================Live Tracking Debug(End)==============================================");
    return commonResponse.success(
      "en",
      res,
      "USER_TRACKING_MULTIPLE_CREATED_SUCCESS",
      201,
      result
    );
  }
}