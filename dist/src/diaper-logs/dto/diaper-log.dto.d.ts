export declare enum DiaperType {
    SOLID = "SOLID",
    LIQUID = "LIQUID",
    BOTH = "BOTH"
}
export declare class CreateDiaperLogDto {
    date: string;
    time: string;
    diaperType: DiaperType;
    note?: string;
    babyId: number;
}
export declare class UpdateDiaperLogDto {
    date?: string;
    time?: string;
    diaperType?: DiaperType;
    note?: string;
}
