import { DiaperType } from '@prisma/client';
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
