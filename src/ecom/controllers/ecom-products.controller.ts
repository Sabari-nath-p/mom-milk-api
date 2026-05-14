import {
    Controller, Post, Get, Patch, Delete, Body, Request,
    UseGuards, Param, ParseIntPipe, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { EcomProductsService } from '../services/ecom-products.service';
import {
    CreateProductDto, UpdateProductDto, ProductQueryDto,
    CreateVariantDto, UpdateVariantDto, CreateCategoryDto, UpdateCategoryDto,
    ProductImageDto,
} from '../dto/product.dto';

@ApiTags('E-Commerce / Products')
@Controller('ecom')
export class EcomProductsController {
    constructor(private readonly productsService: EcomProductsService) {}

    // ─── Categories (Public read, Admin write) ────────────────────────────────

    @Get('categories')
    @ApiOperation({ summary: 'List all active product categories' })
    listCategories() {
        return this.productsService.listCategories();
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @Post('admin/categories')
    @ApiOperation({ summary: '[Admin] Create product category' })
    createCategory(@Body() dto: CreateCategoryDto) {
        return this.productsService.createCategory(dto);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @Patch('admin/categories/:id')
    @ApiOperation({ summary: '[Admin] Update product category' })
    @ApiParam({ name: 'id', type: Number })
    updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
        return this.productsService.updateCategory(id, dto);
    }

    @UseGuards(JwtAuthGuard, AdminGuard)
    @ApiBearerAuth()
    @Delete('admin/categories/:id')
    @ApiOperation({ summary: '[Admin] Delete product category' })
    @ApiParam({ name: 'id', type: Number })
    deleteCategory(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.deleteCategory(id);
    }

    // ─── Products (Public read) ───────────────────────────────────────────────

    @Get('products')
    @ApiOperation({ summary: 'Browse products with filters (search, category, location radius)' })
    findAll(@Query() query: ProductQueryDto) {
        return this.productsService.findAll(query);
    }

    @Get('products/:id')
    @ApiOperation({ summary: 'Get product detail with variants and recent reviews' })
    @ApiParam({ name: 'id', type: Number })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    // ─── Vendor Products (Auth required) ─────────────────────────────────────

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('vendor/my-products')
    @ApiOperation({ summary: '[Vendor] Get my products' })
    getMyProducts(
        @Request() req,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.productsService.getMyProducts(req.user.id, page, limit);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('products')
    @ApiOperation({ summary: '[Vendor] Create a new product' })
    create(@Request() req, @Body() dto: CreateProductDto) {
        return this.productsService.create(req.user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch('products/:id')
    @ApiOperation({ summary: '[Vendor] Update a product' })
    @ApiParam({ name: 'id', type: Number })
    update(
        @Request() req,
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateProductDto,
    ) {
        return this.productsService.update(req.user.id, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete('products/:id')
    @ApiOperation({ summary: '[Vendor] Delete a product' })
    @ApiParam({ name: 'id', type: Number })
    delete(@Request() req, @Param('id', ParseIntPipe) id: number) {
        return this.productsService.delete(req.user.id, id);
    }

    // ─── Variants ─────────────────────────────────────────────────────────────

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('products/:id/variants')
    @ApiOperation({ summary: '[Vendor] Add a variant to a product' })
    @ApiParam({ name: 'id', type: Number })
    addVariant(
        @Request() req,
        @Param('id', ParseIntPipe) productId: number,
        @Body() dto: CreateVariantDto,
    ) {
        return this.productsService.addVariant(req.user.id, productId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Patch('products/:id/variants/:variantId')
    @ApiOperation({ summary: '[Vendor] Update a variant' })
    @ApiParam({ name: 'id', type: Number })
    @ApiParam({ name: 'variantId', type: Number })
    updateVariant(
        @Request() req,
        @Param('id', ParseIntPipe) productId: number,
        @Param('variantId', ParseIntPipe) variantId: number,
        @Body() dto: UpdateVariantDto,
    ) {
        return this.productsService.updateVariant(req.user.id, productId, variantId, dto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete('products/:id/variants/:variantId')
    @ApiOperation({ summary: '[Vendor] Delete a variant' })
    @ApiParam({ name: 'id', type: Number })
    @ApiParam({ name: 'variantId', type: Number })
    deleteVariant(
        @Request() req,
        @Param('id', ParseIntPipe) productId: number,
        @Param('variantId', ParseIntPipe) variantId: number,
    ) {
        return this.productsService.deleteVariant(req.user.id, productId, variantId);
    }

    // ─── Images ───────────────────────────────────────────────────────────────

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Post('products/:id/images')
    @ApiOperation({ summary: '[Vendor] Add images to a product' })
    @ApiParam({ name: 'id', type: Number })
    addImages(
        @Request() req,
        @Param('id', ParseIntPipe) productId: number,
        @Body() body: { images: ProductImageDto[] },
    ) {
        return this.productsService.addImages(req.user.id, productId, body.images);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete('images/:imageId')
    @ApiOperation({ summary: '[Vendor] Delete a product image' })
    @ApiParam({ name: 'imageId', type: Number })
    deleteImage(@Request() req, @Param('imageId', ParseIntPipe) imageId: number) {
        return this.productsService.deleteImage(req.user.id, imageId);
    }
}
