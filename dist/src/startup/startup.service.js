"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StartupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartupService = void 0;
const common_1 = require("@nestjs/common");
const geolocation_service_1 = require("../requests/services/geolocation.service");
const path = require("path");
const fs = require("fs");
let StartupService = StartupService_1 = class StartupService {
    constructor(geolocationService) {
        this.geolocationService = geolocationService;
        this.logger = new common_1.Logger(StartupService_1.name);
    }
    async onModuleInit() {
        this.logger.log('Starting application initialization...');
        try {
            await this.importZipCodesOnStartup();
            this.logger.log('Application initialization completed successfully');
        }
        catch (error) {
            this.logger.error('Error during application initialization:', error);
        }
    }
    async importZipCodesOnStartup() {
        this.logger.log('Checking if zipcode data needs to be imported...');
        const existingZipCodes = await this.geolocationService.findAllZipCodes(1, 1);
        if (existingZipCodes.pagination.totalItems > 0) {
            this.logger.log(`Zipcode data already exists (${existingZipCodes.pagination.totalItems} records). Skipping import.`);
            return;
        }
        const dataDir = path.join(process.cwd(), 'src', 'data');
        if (!fs.existsSync(dataDir)) {
            this.logger.warn('Data directory not found. Skipping zipcode import.');
            return;
        }
        const csvFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('.csv') && file.toLowerCase().includes('zipcode'));
        if (csvFiles.length === 0) {
            this.logger.warn('No zipcode CSV files found in data directory. Using sample data.');
            const sampleCsvPath = path.join(dataDir, 'sample_zipcodes.csv');
            if (fs.existsSync(sampleCsvPath)) {
                await this.importCsvFile(sampleCsvPath);
            }
            else {
                this.logger.warn('Sample zipcode file not found. Skipping import.');
            }
            return;
        }
        const csvFilePath = path.join(dataDir, csvFiles[0]);
        this.logger.log(`Found zipcode CSV file: ${csvFiles[0]}`);
        await this.importCsvFile(csvFilePath);
    }
    async importCsvFile(filePath) {
        try {
            this.logger.log(`Starting import from: ${path.basename(filePath)}`);
            const result = await this.geolocationService.importZipCodesFromFile(filePath);
            this.logger.log(`Successfully imported ${result.imported} zipcode records`);
            if (result.skipped > 0) {
                this.logger.warn(`Import completed with ${result.skipped} records skipped (duplicates or invalid data)`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to import zipcode data from ${path.basename(filePath)}:`, error);
        }
    }
    async forceImportZipCodes(csvFileName) {
        this.logger.log('Forcing zipcode import...');
        const dataDir = path.join(process.cwd(), 'src', 'data');
        let csvFilePath;
        if (csvFileName) {
            csvFilePath = path.join(dataDir, csvFileName);
            if (!fs.existsSync(csvFilePath)) {
                throw new Error(`CSV file not found: ${csvFileName}`);
            }
        }
        else {
            csvFilePath = path.join(dataDir, 'sample_zipcodes.csv');
            if (!fs.existsSync(csvFilePath)) {
                throw new Error('Sample zipcode file not found');
            }
        }
        this.logger.log('Clearing existing zipcode data...');
        await this.importCsvFile(csvFilePath);
        return { message: 'Zipcode import completed successfully' };
    }
};
exports.StartupService = StartupService;
exports.StartupService = StartupService = StartupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [geolocation_service_1.GeolocationService])
], StartupService);
//# sourceMappingURL=startup.service.js.map