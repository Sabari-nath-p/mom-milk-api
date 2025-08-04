export declare enum SleepLocation {
    CRIB = "CRIB",
    BED = "BED",
    STROLLER = "STROLLER",
    OTHER = "OTHER"
}
export declare class CreateSleepLogDto {
    date: string;
    startTime: string;
    endTime: string;
    sleepQuality?: string;
    location: SleepLocation;
    note?: string;
    babyId: number;
}
export declare class UpdateSleepLogDto {
    date?: string;
    startTime?: string;
    endTime?: string;
    sleepQuality?: string;
    location?: SleepLocation;
    note?: string;
}
