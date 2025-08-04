import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsNumber, IsString, IsPositive, IsInt } from 'class-validator';

export enum FeedType {
    BREAST = 'BREAST',
    BOTTLE = 'BOTTLE',
    OTHER = 'OTHER',
}

export enum Position {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    BOTH = 'BOTH',
}

export class CreateFeedLogDto {
    @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
    @IsDateString()
    feedingDate: string;

    @ApiProperty({ example: '2024-01-15T09:00:00.000Z' })
    @IsDateString()
    startTime: string;

    @ApiProperty({ example: '2024-01-15T09:30:00.000Z' })
    @IsDateString()
    endTime: string;

    @ApiProperty({ enum: FeedType, example: FeedType.BREAST })
    @IsEnum(FeedType)
    feedType: FeedType;

    @ApiProperty({ enum: Position, example: Position.LEFT, required: false })
    @IsEnum(Position)
    @IsOptional()
    position?: Position;

    @ApiProperty({ example: 120.5, description: 'Amount in ml', required: false })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    amount?: number;

    @ApiProperty({ example: 'Baby fed well and seemed satisfied', required: false })
    @IsString()
    @IsOptional()
    note?: string;

    @ApiProperty({ example: 1, description: 'Baby ID for this feed log' })
    @IsInt()
    @IsPositive()
    babyId: number;
}

export class UpdateFeedLogDto {
    @ApiProperty({ example: '2024-01-15T00:00:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    feedingDate?: string;

    @ApiProperty({ example: '2024-01-15T09:00:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    startTime?: string;

    @ApiProperty({ example: '2024-01-15T09:30:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    endTime?: string;

    @ApiProperty({ enum: FeedType, example: FeedType.BREAST, required: false })
    @IsEnum(FeedType)
    @IsOptional()
    feedType?: FeedType;

    @ApiProperty({ enum: Position, example: Position.LEFT, required: false })
    @IsEnum(Position)
    @IsOptional()
    position?: Position;

    @ApiProperty({ example: 120.5, description: 'Amount in ml', required: false })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    amount?: number;

    @ApiProperty({ example: 'Baby fed well and seemed satisfied', required: false })
    @IsString()
    @IsOptional()
    note?: string;
}
