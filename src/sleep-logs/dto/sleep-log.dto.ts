import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsInt, IsPositive } from 'class-validator';

export enum SleepLocation {
    CRIB = 'CRIB',
    BED = 'BED',
    STROLLER = 'STROLLER',
    OTHER = 'OTHER',
}

export class CreateSleepLogDto {
    @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
    @IsDateString()
    date: string;

    @ApiProperty({ example: '2024-01-15T20:00:00.000Z' })
    @IsDateString()
    startTime: string;

    @ApiProperty({ example: '2024-01-16T06:00:00.000Z' })
    @IsDateString()
    endTime: string;

    @ApiProperty({ example: 'Deep sleep, peaceful night', required: false })
    @IsString()
    @IsOptional()
    sleepQuality?: string;

    @ApiProperty({ enum: SleepLocation, example: SleepLocation.CRIB })
    @IsEnum(SleepLocation)
    location: SleepLocation;

    @ApiProperty({ example: 'Baby slept well through the night', required: false })
    @IsString()
    @IsOptional()
    note?: string;

    @ApiProperty({ example: 1, description: 'Baby ID for this sleep log' })
    @IsInt()
    @IsPositive()
    babyId: number;
}

export class UpdateSleepLogDto {
    @ApiProperty({ example: '2024-01-15T00:00:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    date?: string;

    @ApiProperty({ example: '2024-01-15T20:00:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    startTime?: string;

    @ApiProperty({ example: '2024-01-16T06:00:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    endTime?: string;

    @ApiProperty({ example: 'Deep sleep, peaceful night', required: false })
    @IsString()
    @IsOptional()
    sleepQuality?: string;

    @ApiProperty({ enum: SleepLocation, example: SleepLocation.CRIB, required: false })
    @IsEnum(SleepLocation)
    @IsOptional()
    location?: SleepLocation;

    @ApiProperty({ example: 'Baby slept well through the night', required: false })
    @IsString()
    @IsOptional()
    note?: string;
}
