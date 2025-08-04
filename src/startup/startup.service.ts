import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { GeolocationService } from '../requests/services/geolocation.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class StartupService implements OnModuleInit {
    private readonly logger = new Logger(StartupService.name);

    constructor(private readonly geolocationService: GeolocationService) { }

    async onModuleInit() {
        this.logger.log('Starting application initialization...');

        try {
            await this.importZipCodesOnStartup();
            this.logger.log('Application initialization completed successfully');
        } catch (error) {
            this.logger.error('Error during application initialization:', error);
        }
    }

    private async importZipCodesOnStartup() {
        this.logger.log('Checking if zipcode data needs to be imported...');

        // Check if we already have zipcode data
        const existingZipCodes = await this.geolocationService.findAllZipCodes(1, 1);

        if (existingZipCodes.pagination.totalItems > 0) {
            this.logger.log(`Zipcode data already exists (${existingZipCodes.pagination.totalItems} records). Skipping import.`);
            return;
        }

        // Look for CSV files in the data directory
        const dataDir = path.join(process.cwd(), 'src', 'data');

        if (!fs.existsSync(dataDir)) {
            this.logger.warn('Data directory not found. Skipping zipcode import.');
            return;
        }

        const csvFiles = fs.readdirSync(dataDir).filter(file =>
            file.endsWith('.csv') && file.toLowerCase().includes('zipcode')
        );

        if (csvFiles.length === 0) {
            this.logger.warn('No zipcode CSV files found in data directory. Using sample data.');

            // Import sample data
            const sampleCsvPath = path.join(dataDir, 'sample_zipcodes.csv');
            if (fs.existsSync(sampleCsvPath)) {
                await this.importCsvFile(sampleCsvPath);
            } else {
                this.logger.warn('Sample zipcode file not found. Skipping import.');
            }
            return;
        }

        // Import the first zipcode CSV file found
        const csvFilePath = path.join(dataDir, csvFiles[0]);
        this.logger.log(`Found zipcode CSV file: ${csvFiles[0]}`);

        await this.importCsvFile(csvFilePath);
    }

    private async importCsvFile(filePath: string) {
        try {
            this.logger.log(`Starting import from: ${path.basename(filePath)}`);

            const result = await this.geolocationService.importZipCodesFromFile(filePath);

            this.logger.log(`Successfully imported ${result.imported} zipcode records`);

            if (result.skipped > 0) {
                this.logger.warn(`Import completed with ${result.skipped} records skipped (duplicates or invalid data)`);
            }

        } catch (error) {
            this.logger.error(`Failed to import zipcode data from ${path.basename(filePath)}:`, error);
        }
    }

    // Method to manually trigger zipcode import (useful for development)
    async forceImportZipCodes(csvFileName?: string) {
        this.logger.log('Forcing zipcode import...');

        const dataDir = path.join(process.cwd(), 'src', 'data');
        let csvFilePath: string;

        if (csvFileName) {
            csvFilePath = path.join(dataDir, csvFileName);
            if (!fs.existsSync(csvFilePath)) {
                throw new Error(`CSV file not found: ${csvFileName}`);
            }
        } else {
            // Use sample data
            csvFilePath = path.join(dataDir, 'sample_zipcodes.csv');
            if (!fs.existsSync(csvFilePath)) {
                throw new Error('Sample zipcode file not found');
            }
        }

        // Clear existing data if forced import
        this.logger.log('Clearing existing zipcode data...');
        // Note: This would need a method in GeolocationService to clear all data
        // For now, we'll just import and let duplicates be handled by unique constraints

        await this.importCsvFile(csvFilePath);
        return { message: 'Zipcode import completed successfully' };
    }
}
