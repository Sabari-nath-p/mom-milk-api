import { IsInt, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SendMessageDto {
  @ApiProperty({ description: "ID of the recipient user" })
  @IsInt()
  @IsNotEmpty()
  recipientId: number;

  @ApiProperty({ description: "Message content" })
  @IsString()
  @IsNotEmpty()
  content: string;
}
