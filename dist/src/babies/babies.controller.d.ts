import { BabiesService } from './babies.service';
import { CreateBabyDto, UpdateBabyDto, Gender } from './dto/baby.dto';
export declare class BabiesController {
    private readonly babiesService;
    constructor(babiesService: BabiesService);
    create(createBabyDto: CreateBabyDto): Promise<{
        user: {
            name: string;
            email: string;
            userType: import(".prisma/client").$Enums.UserType;
            id: number;
        };
    } & {
        name: string;
        bloodGroup: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        gender: import(".prisma/client").$Enums.Gender;
        deliveryDate: Date;
        weight: number | null;
        height: number | null;
        userId: number;
    }>;
    findAll(): Promise<({
        user: {
            name: string;
            email: string;
            userType: import(".prisma/client").$Enums.UserType;
            id: number;
        };
    } & {
        name: string;
        bloodGroup: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        gender: import(".prisma/client").$Enums.Gender;
        deliveryDate: Date;
        weight: number | null;
        height: number | null;
        userId: number;
    })[]>;
    findByUserId(userId: number): Promise<{
        name: string;
        bloodGroup: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        gender: import(".prisma/client").$Enums.Gender;
        deliveryDate: Date;
        weight: number | null;
        height: number | null;
        userId: number;
    }[]>;
    findByGender(gender: Gender): Promise<({
        user: {
            name: string;
            email: string;
            userType: import(".prisma/client").$Enums.UserType;
            id: number;
        };
    } & {
        name: string;
        bloodGroup: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        gender: import(".prisma/client").$Enums.Gender;
        deliveryDate: Date;
        weight: number | null;
        height: number | null;
        userId: number;
    })[]>;
    findByBloodGroup(bloodGroup: string): Promise<({
        user: {
            name: string;
            email: string;
            userType: import(".prisma/client").$Enums.UserType;
            id: number;
        };
    } & {
        name: string;
        bloodGroup: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        gender: import(".prisma/client").$Enums.Gender;
        deliveryDate: Date;
        weight: number | null;
        height: number | null;
        userId: number;
    })[]>;
    findByAgeRange(minMonths: number, maxMonths: number): Promise<({
        user: {
            name: string;
            email: string;
            userType: import(".prisma/client").$Enums.UserType;
            id: number;
        };
    } & {
        name: string;
        bloodGroup: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        gender: import(".prisma/client").$Enums.Gender;
        deliveryDate: Date;
        weight: number | null;
        height: number | null;
        userId: number;
    })[]>;
    findOne(id: number): Promise<{
        user: {
            name: string;
            email: string;
            userType: import(".prisma/client").$Enums.UserType;
            id: number;
        };
        feedLogs: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            feedingDate: Date;
            startTime: Date;
            endTime: Date;
            feedType: import(".prisma/client").$Enums.FeedType;
            position: import(".prisma/client").$Enums.Position | null;
            amount: number | null;
            note: string | null;
            babyId: number;
        }[];
        diaperLogs: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            note: string | null;
            babyId: number;
            date: Date;
            time: Date;
            diaperType: import(".prisma/client").$Enums.DiaperType;
        }[];
        sleepLogs: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            startTime: Date;
            endTime: Date;
            note: string | null;
            babyId: number;
            date: Date;
            sleepQuality: string | null;
            location: import(".prisma/client").$Enums.SleepLocation;
        }[];
    } & {
        name: string;
        bloodGroup: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        gender: import(".prisma/client").$Enums.Gender;
        deliveryDate: Date;
        weight: number | null;
        height: number | null;
        userId: number;
    }>;
    update(id: number, updateBabyDto: UpdateBabyDto): Promise<{
        user: {
            name: string;
            email: string;
            userType: import(".prisma/client").$Enums.UserType;
            id: number;
        };
    } & {
        name: string;
        bloodGroup: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        gender: import(".prisma/client").$Enums.Gender;
        deliveryDate: Date;
        weight: number | null;
        height: number | null;
        userId: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        bloodGroup: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        gender: import(".prisma/client").$Enums.Gender;
        deliveryDate: Date;
        weight: number | null;
        height: number | null;
        userId: number;
    }>;
    removeAllByUserId(userId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
