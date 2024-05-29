import { Injectable } from '@nestjs/common';
import { LoginInputModel } from '../api/pipes/login-input-model';
import { UsersRepository } from '../../users/repositories/user-repository';
import { User, UserDocument } from '../../users/domains/domain-user';
import { HashPasswordService } from '../../../common/service/hash-password-service';
import { TokenJwtService } from '../../../common/service/token-jwt-service';
import { RegistrationInputModel } from '../api/pipes/registration-input-model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as randomCode } from 'uuid';
import { add } from 'date-fns';
import { EmailSendService } from '../../../common/service/email-send-service';
import { RegistrationConfirmationInputModel } from '../api/pipes/registration-comfirmation-input-model';

@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected hashPasswordService: HashPasswordService,
    protected tokenJwtService: TokenJwtService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    protected emailSendService: EmailSendService,
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

  async registrationUser(registrationInputModel: RegistrationInputModel) {
    const { password, login, email } = registrationInputModel;

    /*   login и email  должны быть уникальные--поискать
     их в базе и если такие есть в базе то вернуть
     на фронт ошибку */

    const isExistLogin = await this.usersRepository.isExistLogin(login);
    if (isExistLogin) {
      return { field: 'login', res: 'false' };
    }

    const isExistEmail = await this.usersRepository.isExistEmail(email);
    if (isExistEmail) {
      return { field: 'email', res: 'false' };
    }

    const passwordHash = await this.hashPasswordService.generateHash(password);

    const newUser: UserDocument = new this.userModel({
      login,
      passwordHash,
      email,
      createdAt: new Date().toISOString(),
      confirmationCode: randomCode(),
      isConfirmed: false,
      expirationDate: add(new Date(), { hours: 1, minutes: 2 }).toISOString(),
    });

    const user: UserDocument = await this.usersRepository.save(newUser);

    /* после того как в базе данных сущность уже создана
 ответ фронту покачто не отправляю 
   НАДО отправить письмо с кодом на емайл тому пользователю
   который регистрируется сейчас 
 Н*/

    const code = user.confirmationCode;

    /*    в письме ссылка отбалды написана а по сценарию 
    рабочего приложения она должна перенапрвить
        на фронт и в урле будет КОД и тогда фронт сформирует 
        запрос на подтверждение регистрации с этим кодом
         */

    const letter = `<h1>Thank for your registration</h1>
 <p>To finish registration please follow the link below:
     <a href="https://somesite.com/confirm-email?code=${code}">complete registration</a>
 </p>`;

    /*лучше  обработать ошибку отправки письма*/
    try {
      await this.emailSendService.sendEmail(email, letter);
    } catch (error) {
      console.log(
        'letter was not sent to email: file auth-service.ts... method registrationUser' +
          error,
      );
    }

    return { field: 'any', res: 'true' };
  }

  async registrationConfirmation(
    registrationConfirmationInputModel: RegistrationConfirmationInputModel,
  ) {
    const { code } = registrationConfirmationInputModel;

    return this.usersRepository.updateFlagIsConfirmed(code);
  }
}
