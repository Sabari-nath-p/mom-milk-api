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
  async webhook(@Req() req, @Res() res) {
    const signature = req.headers["stripe-signature"];

    const result = await this.donationsService.handleStripeWebhook(
      req.rawBody,
      signature
    );

    return res.status(result.status).send(result.message);
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
    @Body() dto: UpdateDonationDto
  ) {
    return this.donationsService.update(id, dto);
  }
}
