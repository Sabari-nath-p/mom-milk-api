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
    console.log("\n📩 [Webhook Handler] Starting webhook processing...");

    let event: Stripe.Event;

    // 1. Construct event from raw body + signature
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log(`🔍 Event Verified: ${event.id}`);
      console.log(`📌 Event Type: ${event.type}`);
    } catch (err) {
      console.error("❌ Stripe Signature Verification FAILED");
      console.error("Reason:", err.message);

      return { status: 400, message: `Invalid signature: ${err.message}` };
    }

    // 2. Log event payload (debug-safe)
    console.log("📦 Event Payload Snapshot:", {
      id: event.id,
      type: event.type,
      created: event.created,
    });

    // 3. Process based on event type
    try {
      switch (event.type) {
        case "checkout.session.completed":
          console.log("💳 Checkout Session Completed");
          await this.handleCheckoutCompleted(event.data.object as any);
          break;

        case "payment_intent.succeeded":
          console.log("💰 Payment Intent Succeeded");
          await this.handlePaymentIntentSucceeded(event.data.object as any);
          break;

        default:
          console.warn(`⚠️ Unhandled Event Type: ${event.type}`);
      }
    } catch (processingError) {
      console.error("🔥 Error while processing event:", processingError);
      return { status: 500, message: "Event processing error" };
    }

    return { status: 200, message: "Webhook processed successfully" };
  }

  private async handleCheckoutCompleted(session: any) {
    console.log("\n🧩 [Checkout Completed Handler]");

    if (!session.metadata?.donationId) {
      console.error("❌ Missing donationId in metadata");
      return;
    }

    const donationId = parseInt(session.metadata.donationId);
    console.log(`➡️ Donation ID: ${donationId}`);

    // Validate donation exists
    const donation = await this.prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation) {
      console.error(`❌ Donation not found for ID: ${donationId}`);
      return;
    }

    console.log("🔄 Updating donation status → SUCCESS");

    await this.prisma.donation.update({
      where: { id: donationId },
      data: { status: "SUCCESS" },
    });

    console.log(`🎉 Donation ${donationId} marked SUCCESS`);
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
