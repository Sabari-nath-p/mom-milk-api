import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendCustomNotificationDto {
    @ApiProperty({
        example: '+1234567890',
        description: 'Phone number of the user to send notification to',
    })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({
        example: 'Important Update',
        description: 'Notification title',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        example: 'You have a new message from the support team',
        description: 'Notification body text',
    })
    @IsString()
    @IsNotEmpty()
    body: string;
}
