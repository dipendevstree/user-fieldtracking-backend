import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserTrackingDocument = UserTracking & Document;

@Schema({ timestamps: true })
export class UserTracking {
  @Prop({ required: true })
  workDaySessionId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  organizationId: string;

  @Prop({ type: Number, required: true })
  lat: number;

  @Prop({ type: Number, required: true })
  long: number;

  @Prop({ type: Date, required: true })
  date: Date;
}

export const UserTrackingSchema = SchemaFactory.createForClass(UserTracking);
UserTrackingSchema.index({
  userId: 1,
  date: 1,
  workDaySessionId: 1,
});
