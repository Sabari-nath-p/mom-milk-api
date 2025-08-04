import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsInt, IsPositive } from 'class-validator';

export enum DiaperType {
    SOLID = 'SOLID',
    LIQUID = 'LIQUID',
    BOTH = 'BOTH',
}

export class CreateDiaperLogDto {
    @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
    @IsDateString()
    date: string;

    @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
    @IsDateString()
    time: string;

    @ApiProperty({ enum: DiaperType, example: DiaperType.BOTH })
    @IsEnum(DiaperType)
    diaperType: DiaperType;

    @ApiProperty({ example: 'Normal diaper change, baby was comfortable', required: false })
    @IsString()
    @IsOptional()
    note?: string;

    @ApiProperty({ example: 1, description: 'Baby ID for this diaper log' })
    @IsInt()
    @IsPositive()
    babyId: number;
}

export class UpdateDiaperLogDto {
    @ApiProperty({ example: '2024-01-15T00:00:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    date?: string;

    @ApiProperty({ example: '2024-01-15T10:30:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    time?: string;

    @ApiProperty({ enum: DiaperType, example: DiaperType.BOTH, required: false })
    @IsEnum(DiaperType)
    @IsOptional()
    diaperType?: DiaperType;

    @ApiProperty({ example: 'Normal diaper change, baby was comfortable', required: false })
    @IsString()
    @IsOptional()
    note?: string;
}
