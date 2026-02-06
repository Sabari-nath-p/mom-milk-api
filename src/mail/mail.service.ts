import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: Transporter;
    private isConfigured: boolean = false;

    constructor() {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        try {
            // Check if SMTP configuration is available
            if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
                this.logger.warn('SMTP configuration not found. Email features will be disabled.');
                this.isConfigured = false;
                return;
            }

            // Create transporter
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT),
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                tls: {
                    // Do not fail on invalid certs
                    rejectUnauthorized: false,
                },
            });

            this.isConfigured = true;
            this.logger.log('SMTP transporter initialized successfully');

            // Verify SMTP connection
            this.verifyConnection();
        } catch (error) {
            this.logger.error('Failed to initialize SMTP transporter:', error);
            this.isConfigured = false;
        }
    }

    private async verifyConnection() {
        try {
            await this.transporter.verify();
            this.logger.log('SMTP connection verified successfully');
        } catch (error) {
            this.logger.error('SMTP connection verification failed:', error);
            this.isConfigured = false;
        }
    }

    async sendEmail(options: EmailOptions): Promise<boolean> {
        if (!this.isConfigured) {
            this.logger.warn('SMTP not configured, skipping email send');
            return false;
        }

        try {
            const mailOptions = {
                from: `"MomsMilk App" <${process.env.SMTP_USER}>`,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            };

            const info = await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent successfully to ${options.to}: ${info.messageId}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${options.to}:`, error);
            return false;
        }
    }

    async sendOtpEmail(email: string, otp: string): Promise<boolean> {
        const subject = 'Your OTP for MomsMilk App';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #FF69B4; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                    .otp-box { background-color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF69B4; border: 2px dashed #FF69B4; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🍼 MomsMilk App</h1>
                    </div>
                    <div class="content">
                        <h2>Your One-Time Password</h2>
                        <p>Hello,</p>
                        <p>You have requested to sign in to MomsMilk App. Please use the following OTP to complete your authentication:</p>
                        <div class="otp-box">${otp}</div>
                        <p><strong>This OTP is valid for 5 minutes.</strong></p>
                        <p>If you didn't request this OTP, please ignore this email.</p>
                        <div class="footer">
                            <p>This is an automated message, please do not reply.</p>
                            <p>&copy; ${new Date().getFullYear()} MomsMilk App. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `Your OTP for MomsMilk App is: ${otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you didn't request this OTP, please ignore this email.`;

        return this.sendEmail({ to: email, subject, html, text });
    }

    async sendRequestNotificationEmail(
        donorEmail: string,
        donorName: string,
        requesterName: string,
        requestTitle: string,
        requestDescription: string,
        quantity: number,
        urgency: string,
        requesterFacebookLink?: string,
        requesterInstagramLink?: string
    ): Promise<boolean> {
        const subject = '🍼 New Milk Request Received';

        // Build social links HTML if available
        let socialLinksHtml = '';
        if (requesterFacebookLink || requesterInstagramLink) {
            socialLinksHtml = '<div class="detail-row"><span class="label">Requester Social:</span> ';
            if (requesterFacebookLink) {
                socialLinksHtml += `<a href="${requesterFacebookLink}" target="_blank">Facebook</a>`;
            }
            if (requesterFacebookLink && requesterInstagramLink) {
                socialLinksHtml += ' | ';
            }
            if (requesterInstagramLink) {
                socialLinksHtml += `<a href="${requesterInstagramLink}" target="_blank">Instagram</a>`;
            }
            socialLinksHtml += '</div>';
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #FF69B4; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                    .request-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                    .detail-row { margin: 10px 0; }
                    .label { font-weight: bold; color: #666; }
                    .urgency-badge { display: inline-block; padding: 5px 10px; border-radius: 3px; font-size: 12px; font-weight: bold; }
                    .urgency-high { background-color: #ff4444; color: white; }
                    .urgency-medium { background-color: #ffaa00; color: white; }
                    .urgency-low { background-color: #44aa44; color: white; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
                    a { color: #FF69B4; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🍼 New Request Received!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${donorName},</h2>
                        <p><strong>${requesterName}</strong> has sent you a new milk request:</p>
                        <div class="request-details">
                            <div class="detail-row">
                                <span class="label">Request Title:</span> ${requestTitle}
                            </div>
                            <div class="detail-row">
                                <span class="label">Description:</span> ${requestDescription || 'No description provided'}
                            </div>
                            <div class="detail-row">
                                <span class="label">Quantity:</span> ${quantity} ml
                            </div>
                            <div class="detail-row">
                                <span class="label">Urgency:</span> 
                                <span class="urgency-badge urgency-${urgency.toLowerCase()}">${urgency.toUpperCase()}</span>
                            </div>
                            ${socialLinksHtml}
                        </div>
                        <p>Please log in to the MomsMilk App to review and respond to this request.</p>
                        <div class="footer">
                            <p>This is an automated message, please do not reply.</p>
                            <p>&copy; ${new Date().getFullYear()} MomsMilk App. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        let socialLinksText = '';
        if (requesterFacebookLink || requesterInstagramLink) {
            socialLinksText = '\nRequester Social:';
            if (requesterFacebookLink) socialLinksText += `\nFacebook: ${requesterFacebookLink}`;
            if (requesterInstagramLink) socialLinksText += `\nInstagram: ${requesterInstagramLink}`;
        }

        const text = `Hello ${donorName},\n\n${requesterName} has sent you a new milk request:\n\nRequest: ${requestTitle}\nDescription: ${requestDescription || 'No description provided'}\nQuantity: ${quantity} ml\nUrgency: ${urgency.toUpperCase()}${socialLinksText}\n\nPlease log in to the MomsMilk App to review and respond to this request.`;

        return this.sendEmail({ to: donorEmail, subject, html, text });
    }

    async sendRequestAcceptedEmail(
        buyerEmail: string,
        buyerName: string,
        donorName: string,
        donorPhone: string,
        requestTitle: string,
        donorFacebookLink?: string,
        donorInstagramLink?: string
    ): Promise<boolean> {
        const subject = '✅ Your Request Has Been Accepted!';

        // Build social links HTML if available
        let socialLinksHtml = '';
        if (donorFacebookLink || donorInstagramLink) {
            socialLinksHtml = '<div class="detail-row"><span class="label">Connect:</span> ';
            const links = [];
            if (donorFacebookLink) links.push(`<a href="${donorFacebookLink}" target="_blank">Facebook</a>`);
            if (donorInstagramLink) links.push(`<a href="${donorInstagramLink}" target="_blank">Instagram</a>`);
            socialLinksHtml += links.join(' | ') + '</div>';
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #44aa44; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                    .success-box { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #44aa44; }
                    .contact-info { background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .detail-row { margin: 10px 0; }
                    .label { font-weight: bold; color: #666; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
                    a { color: #44aa44; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Request Accepted!</h1>
                    </div>
                    <div class="content">
                        <h2>Great News, ${buyerName}!</h2>
                        <div class="success-box">
                            <p><strong>${donorName}</strong> has accepted your milk request: <strong>"${requestTitle}"</strong></p>
                        </div>
                        <div class="contact-info">
                            <h3>Donor Contact Information:</h3>
                            <div class="detail-row">
                                <span class="label">Name:</span> ${donorName}
                            </div>
                            <div class="detail-row">
                                <span class="label">Phone:</span> ${donorPhone}
                            </div>
                            ${socialLinksHtml}
                        </div>
                        <p>You can now contact the donor directly to arrange the pickup or delivery.</p>
                        <p>Please log in to the MomsMilk App for more details.</p>
                        <div class="footer">
                            <p>This is an automated message, please do not reply.</p>
                            <p>&copy; ${new Date().getFullYear()} MomsMilk App. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        let socialLinksText = '';
        if (donorFacebookLink || donorInstagramLink) {
            socialLinksText = '\n\nConnect with donor:';
            if (donorFacebookLink) socialLinksText += `\nFacebook: ${donorFacebookLink}`;
            if (donorInstagramLink) socialLinksText += `\nInstagram: ${donorInstagramLink}`;
        }

        const text = `Great News, ${buyerName}!\n\n${donorName} has accepted your milk request: "${requestTitle}"\n\nDonor Contact Information:\nName: ${donorName}\nPhone: ${donorPhone}${socialLinksText}\n\nYou can now contact the donor directly to arrange the pickup or delivery.\n\nPlease log in to the MomsMilk App for more details.`;

        return this.sendEmail({ to: buyerEmail, subject, html, text });
    }

    async sendAvailabilityNotificationEmail(
        buyerEmail: string,
        buyerName: string,
        donorName: string,
        requestTitle: string,
        donorFacebookLink?: string,
        donorInstagramLink?: string
    ): Promise<boolean> {
        const subject = '💝 Donor is Now Available!';

        // Build contact section if any contact info is provided
        let contactHtml = '';
        let contactText = '';
        if (donorFacebookLink || donorInstagramLink) {
            contactHtml = `
                <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #FF69B4;">Connect with ${donorName}:</h3>
            `;
            contactText = `\n\nConnect with ${donorName}:\n`;

            if (donorFacebookLink) {
                contactHtml += `<p style="margin: 10px 0;">📘 <strong>Facebook:</strong> <a href="${donorFacebookLink}" style="color: #FF69B4;" target="_blank">View Profile</a></p>`;
                contactText += `Facebook: ${donorFacebookLink}\n`;
            }
            if (donorInstagramLink) {
                contactHtml += `<p style="margin: 10px 0;">📸 <strong>Instagram:</strong> <a href="${donorInstagramLink}" style="color: #FF69B4;" target="_blank">View Profile</a></p>`;
                contactText += `Instagram: ${donorInstagramLink}\n`;
            }

            contactHtml += `</div>`;
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #FF69B4; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                    .notification-box { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #FF69B4; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💝 Donor Available!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello ${buyerName},</h2>
                        <div class="notification-box">
                            <p><strong>${donorName}</strong> is now available and might be able to help with your request: <strong>"${requestTitle}"</strong></p>
                        </div>
                        ${contactHtml}
                        <p>This is a great opportunity to reach out to the donor${contactHtml ? '' : ' through the app'}.</p>
                        <p>Please log in to the MomsMilk App to check the latest status and connect with the donor.</p>
                        <div class="footer">
                            <p>This is an automated message, please do not reply.</p>
                            <p>&copy; ${new Date().getFullYear()} MomsMilk App. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `Hello ${buyerName},\n\n${donorName} is now available and might be able to help with your request: "${requestTitle}"${contactText}\n\nThis is a great opportunity to reach out to the donor${contactText ? '' : ' through the app'}.\n\nPlease log in to the MomsMilk App to check the latest status and connect with the donor.`;

        return this.sendEmail({ to: buyerEmail, subject, html, text });
    }

    async sendZipcodeNotFoundEmail(zipcode: string, userEmail: string): Promise<boolean> {
        const adminEmail = 'sabarinath5604@gmail.com';
        const subject = '⚠️ Missing Zipcode Report';

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #FFA500; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
                    .alert-box { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #FFA500; }
                    .detail-row { margin: 10px 0; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                    .label { font-weight: bold; color: #666; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #777; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Missing Zipcode Report</h1>
                    </div>
                    <div class="content">
                        <h2>Admin Alert,</h2>
                        <div class="alert-box">
                            <p>A user attempted to register with a zipcode that was not found in the database or Google Geocoding API.</p>
                        </div>
                        <div class="details">
                            <div class="detail-row">
                                <span class="label">Missing Zipcode:</span> ${zipcode}
                            </div>
                            <div class="detail-row">
                                <span class="label">User Email:</span> ${userEmail}
                            </div>
                            <div class="detail-row">
                                <span class="label">Time:</span> ${new Date().toLocaleString()}
                            </div>
                        </div>
                        <p>Please verify this zipcode and add it to the database manually if valid.</p>
                        <div class="footer">
                            <p>This is an automated system report.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const text = `⚠️ Missing Zipcode Report\n\nA user attempted to register with a zipcode that was not found.\n\nMissing Zipcode: ${zipcode}\nUser Email: ${userEmail}\nTime: ${new Date().toLocaleString()}\n\nPlease verify this zipcode and add it to the database manually if valid.`;

        return this.sendEmail({ to: adminEmail, subject, html, text });
    }
}
