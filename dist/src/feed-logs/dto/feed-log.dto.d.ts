export declare enum FeedType {
    BREAST = "BREAST",
    BOTTLE = "BOTTLE",
    OTHER = "OTHER"
}
export declare enum Position {
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    BOTH = "BOTH"
}
export declare class CreateFeedLogDto {
    feedingDate: string;
    startTime: string;
    endTime: string;
    feedType: FeedType;
    position?: Position;
    amount?: number;
    note?: string;
    babyId: number;
}
export declare class UpdateFeedLogDto {
    feedingDate?: string;
    startTime?: string;
    endTime?: string;
    feedType?: FeedType;
    position?: Position;
    amount?: number;
    note?: string;
}
