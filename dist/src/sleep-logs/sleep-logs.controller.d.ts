import { SleepLogsService } from './sleep-logs.service';
import { CreateSleepLogDto, UpdateSleepLogDto, SleepLocation } from './dto/sleep-log.dto';
export declare class SleepLogsController {
    private readonly sleepLogsService;
    constructor(sleepLogsService: SleepLogsService);
    create(createSleepLogDto: CreateSleepLogDto): Promise<{
        baby: {
            name: string;
            id: number;
            user: {
                name: string;
                email: string;
                id: number;
            };
            gender: import(".prisma/client").$Enums.Gender;
        };
    } & {
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
    }>;
    findAll(): Promise<({
        baby: {
            name: string;
            id: number;
            user: {
                name: string;
                email: string;
                id: number;
            };
            gender: import(".prisma/client").$Enums.Gender;
        };
    } & {
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
    })[]>;
    findByBabyId(babyId: number): Promise<{
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
    }[]>;
    findByBabyIdAndDateRange(babyId: number, startDate: string, endDate: string): Promise<{
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
    }[]>;
    getSleepAnalytics(babyId: number, startDate: string, endDate: string): Promise<{
        sleepLogs: {
            durationHours: number;
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
        analytics: {
            totalSleepSessions: number;
            totalSleepHours: number;
            averageSleepHours: number;
        };
    }>;
    findByLocation(location: SleepLocation): Promise<({
        baby: {
            name: string;
            id: number;
            gender: import(".prisma/client").$Enums.Gender;
        };
    } & {
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
    })[]>;
    findOne(id: number): Promise<{
        baby: {
            name: string;
            id: number;
            user: {
                name: string;
                email: string;
                id: number;
            };
            gender: import(".prisma/client").$Enums.Gender;
        };
    } & {
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
    }>;
    update(id: number, updateSleepLogDto: UpdateSleepLogDto): Promise<{
        baby: {
            name: string;
            id: number;
            user: {
                name: string;
                email: string;
                id: number;
            };
            gender: import(".prisma/client").$Enums.Gender;
        };
    } & {
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
    }>;
    remove(id: number): Promise<{
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
    }>;
    removeAllByBabyId(babyId: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
