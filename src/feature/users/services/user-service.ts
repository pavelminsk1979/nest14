import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domains/domain-user';
import { UsersRepository } from '../repositories/user-repository';
import { Types } from 'mongoose';
import { CreateUserInputModel } from '../api/pipes/create-user-input-model';
import { HashPasswordService } from '../../../common/service/hash-password-service';
import { v4 as randomCode } from 'uuid';

@Injectable()
/*@Injectable()-декоратор что данный клас инжектируемый
 * ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ UsersService В ФАЙЛ app.module
 * providers: [AppService,UsersService]*/
export class UsersService {
  constructor(
    /* вот тут моделька инжектится
    именно декоратор  @InjectModel  определяет
    что происходит инжектирование
      -- (User.name)  регистрируется по имени
       также как в   app.module  в  imports
       и это будет скорей всего строка 'user'
       --<UserDocument> это тип умного обьекта
       ---userModel - это  свойство текущего класса ,
       это будет ТОЖЕ КЛАСС(это Моделька от mongoose).*/
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    protected usersRepository: UsersRepository,
    protected hashPasswordService: HashPasswordService,
  ) {}

  async createUser(createUserInputModel: CreateUserInputModel) {
    const { login, password, email } = createUserInputModel;

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
    /*    тут создаю нового юзера---использую МОДЕЛЬКУ ЮЗЕРА(это
        класс и при создании классу передаю данные  (это
        обьект с значениями которые нужны (согластно 
         СВАГЕРА) для зоздания нового юзера )) КЛАСС-МОДЕЛЬКА  ЭТО ЗАВИСИМОСТЬ -ПОЭТОМУ В НУТРИ МЕТОДА
         ОБРАЩЕНИЕ ИДЕТ ЧЕРЕЗ  this*/
    const newUser: UserDocument = new this.userModel({
      login,
      passwordHash,
      email,
      createdAt: new Date().toISOString(),
      confirmationCode: randomCode(),
      isConfirmed: true,
      expirationDate: new Date().toISOString(),
    });

    /*типизация умного экземпляра будет
    export type UserDocument = HydratedDocument<User>;
такой типизацией можно типизировать документ
    до обращения в базу данных и у него еще не
    будет (_id)   и такойже типизацией можно
    типизировать после обращения к базе данных*/

    const user: UserDocument = await this.usersRepository.save(newUser);

    return { field: 'id', res: user._id.toString() };
  }

  async deleteUserById(userId: string) {
    const result = await this.userModel.deleteOne({
      _id: new Types.ObjectId(userId),
    });

    /*Переменная result будет содержать обьект и в нем несколько
    свойств ---использую свойство  deletedCount: число,
     представляющее количество удаленных документов.
      и преобразую число в булевое значение */
    return !!result.deletedCount;
  }
}
