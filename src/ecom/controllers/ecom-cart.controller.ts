import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Request,
  UseGuards,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { EcomCartService } from "../services/ecom-cart.service";
import { AddToCartDto, UpdateCartItemDto } from "../dto/cart.dto";

@ApiTags("E-Commerce / Cart")
@Controller("ecom/cart")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EcomCartController {
  constructor(private readonly cartService: EcomCartService) {}

  @Get()
  @ApiOperation({ summary: "Get my shopping cart" })
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post("items")
  @ApiOperation({ summary: "Add item to cart" })
  addItem(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @Patch("items/:itemId")
  @ApiOperation({ summary: "Update cart item quantity (set 0 to remove)" })
  @ApiParam({ name: "itemId", type: Number })
  updateItem(
    @Request() req,
    @Param("itemId", ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.id, itemId, dto);
  }

  @Delete("items/:itemId")
  @ApiOperation({ summary: "Remove item from cart" })
  @ApiParam({ name: "itemId", type: Number })
  removeItem(@Request() req, @Param("itemId", ParseIntPipe) itemId: number) {
    return this.cartService.removeItem(req.user.id, itemId);
  }

  @Delete()
  @ApiOperation({ summary: "Clear all items from cart" })
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
