import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginInputModel } from './pipes/login-input-model';
import { AuthService } from '../services/auth-service';
import { RegistrationInputModel } from './pipes/registration-input-model';
import { RegistrationConfirmationInputModel } from './pipes/registration-comfirmation-input-model';

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

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async handleRegistration(
    @Body() registrationInputModel: RegistrationInputModel,
  ) {
    const result: { field: string; res: string } =
      await this.authService.registrationUser(registrationInputModel);

    if (result.res === 'false') {
      throw new BadRequestException([
        {
          message: `field ${result.field} must be unique`,
          field: `${result.field}`,
        },
      ]);
    } else {
      return;
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async handleRegistrationConfirmation(
    @Body()
    registrationConfirmationInputModel: RegistrationConfirmationInputModel,
  ) {
    const result: boolean = await this.authService.registrationConfirmation(
      registrationConfirmationInputModel,
    );

    if (result) {
      return;
    } else {
      throw new NotFoundException(
        'confirmation failed :andpoint-auth,url-auth/registration-confirmation',
      );
    }
  }
}
