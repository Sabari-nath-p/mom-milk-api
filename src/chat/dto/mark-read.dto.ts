import { IsArray, IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class MarkMessagesReadDto {
  @ApiProperty({ description: "Array of message IDs to mark as read" })
  @IsArray()
  @IsInt({ each: true })
  messageIds: number[];
}
