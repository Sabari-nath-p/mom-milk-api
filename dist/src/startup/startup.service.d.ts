import { OnModuleInit } from '@nestjs/common';
import { GeolocationService } from '../requests/services/geolocation.service';
export declare class StartupService implements OnModuleInit {
    private readonly geolocationService;
    private readonly logger;
    constructor(geolocationService: GeolocationService);
    onModuleInit(): Promise<void>;
    private importZipCodesOnStartup;
    private importCsvFile;
    forceImportZipCodes(csvFileName?: string): Promise<{
        message: string;
    }>;
}
