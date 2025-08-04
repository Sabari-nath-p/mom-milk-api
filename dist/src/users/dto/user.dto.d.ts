export declare enum UserType {
    DONOR = "DONOR",
    BUYER = "BUYER",
    ADMIN = "ADMIN"
}
export declare class CreateUserDto {
    name: string;
    email: string;
    phone: string;
    zipcode: string;
    userType: UserType;
    description?: string;
    bloodGroup?: string;
    babyDeliveryDate?: string;
    healthStyle?: string;
    ableToShareMedicalRecord?: boolean;
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    zipcode?: string;
    userType?: UserType;
    description?: string;
    bloodGroup?: string;
    babyDeliveryDate?: string;
    healthStyle?: string;
    ableToShareMedicalRecord?: boolean;
}
