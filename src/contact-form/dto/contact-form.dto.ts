import { IsEmail, IsNotEmpty, IsString, IsUrl } from "class-validator";

export class CreateContactFormDto {
  @IsString()
  @IsNotEmpty()
  Name: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
