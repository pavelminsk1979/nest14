import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginInputModel } from './pipes/login-input-model';
import { AuthService } from '../services/auth-service';

@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async handleLogin(
    @Body() loginInputModel: LoginInputModel,
  ): Promise<{ accessToken: string } | null> {
    const accessToken: string | null =
      await this.authService.loginUser(loginInputModel);

    if (accessToken) {
      return { accessToken };
    } else {
      throw new UnauthorizedException(
        "user didn't login:andpoint-post,url-auth/login",
      );
    }
  }
}
