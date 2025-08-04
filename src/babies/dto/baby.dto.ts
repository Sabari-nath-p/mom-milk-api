import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsDateString, IsOptional, IsNumber, IsPositive, IsInt } from 'class-validator';

export enum Gender {
    BOY = 'BOY',
    GIRL = 'GIRL',
    OTHER = 'OTHER',
}

export class CreateBabyDto {
    @ApiProperty({ example: 'Emma Johnson' })
    @IsString()
    name: string;

    @ApiProperty({ enum: Gender, example: Gender.GIRL })
    @IsEnum(Gender)
    gender: Gender;

    @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
    @IsDateString()
    deliveryDate: string;

    @ApiProperty({ example: 'O+', required: false })
    @IsString()
    @IsOptional()
    bloodGroup?: string;

    @ApiProperty({ example: 3.2, description: 'Weight in kg', required: false })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    weight?: number;

    @ApiProperty({ example: 50.5, description: 'Height in cm', required: false })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    height?: number;

    @ApiProperty({ example: 1, description: 'User ID who owns this baby profile' })
    @IsInt()
    @IsPositive()
    userId: number;
}

export class UpdateBabyDto {
    @ApiProperty({ example: 'Emma Johnson', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ enum: Gender, example: Gender.GIRL, required: false })
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @ApiProperty({ example: '2024-01-15T00:00:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    deliveryDate?: string;

    @ApiProperty({ example: 'O+', required: false })
    @IsString()
    @IsOptional()
    bloodGroup?: string;

    @ApiProperty({ example: 3.2, description: 'Weight in kg', required: false })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    weight?: number;

    @ApiProperty({ example: 50.5, description: 'Height in cm', required: false })
    @IsNumber()
    @IsPositive()
    @IsOptional()
    height?: number;
}
