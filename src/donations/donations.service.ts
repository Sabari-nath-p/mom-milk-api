import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDonationDto } from "./dto/create-donation.dto";
import { UpdateDonationDto } from "./dto/update-donation.dto";
import Stripe from "stripe";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";

@Injectable()
export class DonationsService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDonationDto) {
    try {
      // 1. Create Stripe Payment Intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(dto.amount * 100),
        currency: dto.currency,
        payment_method: dto.stripePaymentMethodId,
        confirm: true,
      });

      // 2. Save donation record
      const donation = await this.prisma.donation.create({
        data: {
          amount: dto.amount,
          currency: dto.currency,
          stripePaymentIntentId: paymentIntent.id,
          status: paymentIntent.status === "succeeded" ? "SUCCESS" : "PENDING",
          donorEmail: dto.donorEmail,
          donorName: dto.donorName,
        },
      });

      return {
        message: "Donation processed successfully",
        donation,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    return this.prisma.donation.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number) {
    const donation = await this.prisma.donation.findUnique({
      where: { id },
    });

    if (!donation) {
      throw new BadRequestException("Donation not found");
    }

    return donation;
  }

  async update(id: number, dto: UpdateDonationDto) {
    return this.prisma.donation.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async createCheckoutSession(dto: CreateCheckoutSessionDto) {
    // 1. Create DB entry (PENDING)
    const donation = await this.prisma.donation.create({
      data: {
        amount: dto.amount,
        currency: dto.currency,
        status: "PENDING",
        donorEmail: dto.donorEmail,
        donorName: dto.donorName,
        stripePaymentIntentId: "", // will update later
      },
    });

    // 2. Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: dto.currency,
            unit_amount: Math.round(dto.amount * 100),
            product_data: {
              name: "Donation to Mom Milk Foundation",
              description: `Donation by ${dto.donorName || "Guest Donor"}`,
            },
          },
          quantity: 1,
        },
      ],

      metadata: {
        donationId: donation.id.toString(),
        donorName: dto.donorName || "",
        donorEmail: dto.donorEmail || "",
      },

      customer_email: dto.donorEmail,
      success_url: dto.successUrl || "https://yourdomain.com/donation-success",
      cancel_url: dto.cancelUrl || "https://yourdomain.com/donation-cancel",
    });

    // 3. Save session ID in donation record
    await this.prisma.donation.update({
      where: { id: donation.id },
      data: { stripePaymentIntentId: session.id },
    });

    return { donationId: donation.id, url: session.url };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return { status: 400, message: `Webhook Error: ${err.message}` };
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutCompleted(event.data.object as any);
        break;

      case "payment_intent.succeeded":
        await this.handlePaymentIntentSucceeded(event.data.object as any);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { status: 200, message: "Webhook Received" };
  }

  private async handleCheckoutCompleted(session: any) {
    const donationId = parseInt(session.metadata.donationId);

    await this.prisma.donation.update({
      where: { id: donationId },
      data: { status: "SUCCESS" },
    });

    console.log(`Donation ${donationId} marked as SUCCESS`);
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any) {
    const donationId = parseInt(paymentIntent.metadata.donationId);

    await this.prisma.donation.update({
      where: { id: donationId },
      data: { status: "SUCCESS" },
    });

    console.log(`Donation ${donationId} completed via PaymentIntent`);
  }
}
