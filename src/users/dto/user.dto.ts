import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, IsDateString, IsArray } from 'class-validator';

export enum UserType {
    DONOR = 'DONOR',
    BUYER = 'BUYER',
    ADMIN = 'ADMIN',
}

export class CreateUserDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '+1234567890' })
    @IsString()
    phone: string;

    @ApiProperty({ example: '12345' })
    @IsString()
    zipcode: string;

    @ApiProperty({ enum: UserType, example: UserType.DONOR })
    @IsEnum(UserType)
    userType: UserType;

    // Donor specific fields (only required for DONOR type)
    @ApiProperty({
        example: 'Healthy mother willing to donate breast milk',
        required: false,
        description: 'Required for donor accounts only'
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        example: 'O+',
        required: false,
        description: 'Blood group - optional for donor accounts'
    })
    @IsString()
    @IsOptional()
    bloodGroup?: string;

    @ApiProperty({
        example: '2024-01-15T00:00:00.000Z',
        required: false,
        description: 'Baby delivery date - required for donor accounts'
    })
    @IsDateString()
    @IsOptional()
    babyDeliveryDate?: string;

    @ApiProperty({
        example: '["healthy_diet", "regular_exercise", "no_smoking"]',
        required: false,
        description: 'Health lifestyle as JSON string array - for donor accounts'
    })
    @IsString()
    @IsOptional()
    healthStyle?: string;

    @ApiProperty({
        example: true,
        required: false,
        description: 'Whether donor is able to share medical records'
    })
    @IsBoolean()
    @IsOptional()
    ableToShareMedicalRecord?: boolean;
}

export class UpdateUserDto {
    @ApiProperty({ example: 'John Doe', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'john.doe@example.com', required: false })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ example: '+1234567890', required: false })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({ example: '12345', required: false })
    @IsString()
    @IsOptional()
    zipcode?: string;

    @ApiProperty({ enum: UserType, example: UserType.DONOR, required: false })
    @IsEnum(UserType)
    @IsOptional()
    userType?: UserType;

    // Donor specific fields
    @ApiProperty({
        example: 'Healthy mother willing to donate breast milk',
        required: false
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'O+', required: false })
    @IsString()
    @IsOptional()
    bloodGroup?: string;

    @ApiProperty({ example: '2024-01-15T00:00:00.000Z', required: false })
    @IsDateString()
    @IsOptional()
    babyDeliveryDate?: string;

    @ApiProperty({
        example: '["healthy_diet", "regular_exercise", "no_smoking"]',
        required: false
    })
    @IsString()
    @IsOptional()
    healthStyle?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    ableToShareMedicalRecord?: boolean;
}
