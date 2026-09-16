import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";
import { UploadsService } from "../uploads/uploads.service";
import { CreateUserDto, UpdateUserDto, UserType } from "./dto/user.dto";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new user (donor, buyer, or admin)" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Bad request - validation failed" })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "List of all users" })
  findAll() {
    return this.usersService.findAll();
  }

  @Get("donors")
  @ApiOperation({ summary: "Get all donor users (can filter by tags)" })
  @ApiQuery({
    name: "tags",
    required: false,
    description: "Comma-separated list of tags to filter by (e.g. active,verified)",
  })
  @ApiResponse({ status: 200, description: "List of donors" })
  findDonors(@Query("tags") tags?: string) {
    return this.usersService.findDonors(tags);
  }

  @Get("buyers")
  @ApiOperation({ summary: "Get all buyer users" })
  @ApiResponse({ status: 200, description: "List of all buyers" })
  findBuyers() {
    return this.usersService.findBuyers();
  }

  @Get("admins")
  @ApiOperation({ summary: "Get all admin users" })
  @ApiResponse({ status: 200, description: "List of all admins" })
  findAdmins() {
    return this.usersService.findAdmins();
  }

  @Get("donors/zipcode/:zipcode")
  @ApiOperation({ summary: "Get donors by zipcode" })
  @ApiParam({ name: "zipcode", description: "Zipcode to search for donors" })
  @ApiResponse({
    status: 200,
    description: "List of donors in the specified zipcode",
  })
  findDonorsByZipcode(@Param("zipcode") zipcode: string) {
    return this.usersService.findDonorsByZipcode(zipcode);
  }

  @Get("donors/medical-record-sharing")
  @ApiOperation({ summary: "Get donors willing to share medical records" })
  @ApiResponse({
    status: 200,
    description: "List of donors willing to share medical records",
  })
  findDonorsWillingToShareMedicalRecord() {
    return this.usersService.findDonorsWillingToShareMedicalRecord();
  }

  @Get("email/:email")
  @ApiOperation({ summary: "Get user by email" })
  @ApiParam({ name: "email", description: "User email" })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 404, description: "User not found" })
  findByEmail(@Param("email") email: string) {
    return this.usersService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":id/profile")
  @ApiOperation({ summary: "Get user profile with active marketplace listings" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User profile found" })
  @ApiResponse({ status: 404, description: "User not found" })
  getProfileWithListings(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getProfileWithListings(id);
  }

  // ─── Dashboard & Activity Endpoints ─────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":id/donor-summary")
  @ApiOperation({ summary: "Get donor summary (listings, requests, donations)" })
  @ApiParam({ name: "id", description: "Donor User ID" })
  @ApiResponse({ status: 200, description: "Donor summary retrieved successfully" })
  getDonorSummary(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getDonorSummary(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":id/donor-activity")
  @ApiOperation({ summary: "Get donor recent activity (incoming & accepted requests)" })
  @ApiParam({ name: "id", description: "Donor User ID" })
  @ApiResponse({ status: 200, description: "Donor activity retrieved successfully" })
  getDonorRecentActivity(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getDonorRecentActivity(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":id/buyer-summary")
  @ApiOperation({ summary: "Get buyer summary (requests, accepted donors, deliveries)" })
  @ApiParam({ name: "id", description: "Buyer User ID" })
  @ApiResponse({ status: 200, description: "Buyer summary retrieved successfully" })
  getBuyerSummary(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getBuyerSummary(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":id/buyer-activity")
  @ApiOperation({ summary: "Get buyer recent activity (recent requests)" })
  @ApiParam({ name: "id", description: "Buyer User ID" })
  @ApiResponse({ status: 200, description: "Buyer activity retrieved successfully" })
  getBuyerRecentActivity(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.getBuyerRecentActivity(id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 404, description: "User not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post(":id/profile-photo")
  @ApiOperation({ summary: "Upload and update user profile photo" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
      required: ["file"],
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  @ApiResponse({
    status: 200,
    description: "Profile photo updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request - invalid file" })
  @ApiResponse({ status: 404, description: "User not found" })
  async updateProfilePhoto(
    @Param("id", ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    const nonImage = !file.mimetype?.startsWith("image/");
    if (nonImage) {
      throw new BadRequestException("Only image files are allowed");
    }
    const results = await this.uploadsService.uploadImages([file]);
    return this.usersService.update(id, { profilePhoto: results[0].url });
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
