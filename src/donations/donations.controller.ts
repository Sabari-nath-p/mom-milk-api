import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  RawBody,
  Req,
  Res,
} from "@nestjs/common";
import { DonationsService } from "./donations.service";
import { CreateDonationDto } from "./dto/create-donation.dto";
import { UpdateDonationDto } from "./dto/update-donation.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { CreateCheckoutSessionDto } from "./dto/create-checkout-session.dto";

@ApiTags("Donations")
@Controller("donations")
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new donation" })
  create(@Body() dto: CreateDonationDto) {
    return this.donationsService.create(dto);
  }

  @Post("checkout")
  createCheckout(@Body() dto: CreateCheckoutSessionDto) {
    return this.donationsService.createCheckoutSession(dto);
  }

  @Post("webhook")
  async handleWebhook(@Req() req, @Res() res) {
    console.log("\n🔔 [WEBHOOK RECEIVED] Stripe sent a webhook event");

    const signature = req.headers["stripe-signature"];
    if (!signature) {
      console.error("❌ Missing stripe-signature header");
      return res.status(400).send("Missing stripe-signature header");
    }

    try {
      const result = await this.donationsService.handleStripeWebhook(
        req.rawBody,
        signature,
      );

      console.log("✅ Webhook handled successfully:", result.message);
      return res.status(result.status).send(result.message);
    } catch (error) {
      console.error("🔥 Webhook Handler Error:", error);
      return res.status(500).send("Webhook internal error");
    }
  }

  @Get()
  @ApiOperation({ summary: "Get all donations" })
  findAll() {
    return this.donationsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single donation by ID" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.donationsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update donation status" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateDonationDto,
  ) {
    return this.donationsService.update(id, dto);
  }
}
