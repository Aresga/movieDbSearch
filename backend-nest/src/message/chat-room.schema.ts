import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChatRoom extends Document {

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  participants: string[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage: string;

  @Prop()
  updatedAt: Date;

}
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
