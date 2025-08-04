export declare enum Gender {
    BOY = "BOY",
    GIRL = "GIRL",
    OTHER = "OTHER"
}
export declare class CreateBabyDto {
    name: string;
    gender: Gender;
    deliveryDate: string;
    bloodGroup?: string;
    weight?: number;
    height?: number;
    userId: number;
}
export declare class UpdateBabyDto {
    name?: string;
    gender?: Gender;
    deliveryDate?: string;
    bloodGroup?: string;
    weight?: number;
    height?: number;
}
