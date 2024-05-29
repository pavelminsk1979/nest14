import { Injectable } from '@nestjs/common';
import { LoginInputModel } from '../api/pipes/login-input-model';
import { UsersRepository } from '../../users/repositories/user-repository';
import { UserDocument } from '../../users/domains/domain-user';
import { HashPasswordService } from '../../../common/service/hash-password-service';
import { TokenJwtService } from '../../../common/service/token-jwt-service';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected hashPasswordService: HashPasswordService,
    protected tokenJwtService: TokenJwtService,
  ) {}

  async loginUser(loginInputModel: LoginInputModel) {
    const { loginOrEmail, password } = loginInputModel;

    const user: UserDocument | null =
      await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);

    if (!user) return null;

    const passwordHash = user.passwordHash;

    const isCorrectPassword = await this.hashPasswordService.checkPassword(
      password,
      passwordHash,
    );

    if (!isCorrectPassword) return null;

    /*--далее устанавливаю библиотеки для JwtToken
     ---создаю tokenJwtServise
     -- в env переменную положить секрет
      ACCESSTOKEN_SECRET='12secret'*/

    const userId = user._id.toString();

    const accessToken = await this.tokenJwtService.createAccessToken(userId);

    if (!accessToken) return null;

    return accessToken;
  }
}
