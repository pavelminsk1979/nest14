import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from '../services/user-service';
import { UserQueryRepository } from '../repositories/user-query-repository';
import { CreateUserInputModel, UserQueryParams } from '../types/models';

@Controller('users')
/* @Controller()-- декоратор,
 который применяется к классу , указывает,
 что этот класс является контроллером. Контроллеры в NestJS отвечают за
  обработку HTTP-запросов и определение маршрутов
  В аргументе   ('users')   это URL на который
  запросы придут и данный controller  их  обработает
  ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ UsersController В ФАЙЛ app.module
  controllers: []*/
export class UsersController {
  /* Здесь используется механизм внедрения зависимостей.
    Когда экземпляр данного класса  создается, NestJS автоматически
   внедряет экземпляры классов UsersService и UserQueryRepository */
  constructor(
    protected usersService: UsersService,
    protected userQueryRepository: UserQueryRepository,
  ) {}

  /*@HttpCode(HttpStatus.OK)-чтобы статус код возвращать
    управляемо..только тут прописать
    ЕСЛИ ПО УМОЛЧАНИЮ(не прописывать такой декоратор)
    то код успешный  200*/
  @HttpCode(HttpStatus.CREATED)
  @Post()
  /* ИЗ БОДИ ВОЗМУ ПРИХОДЯЩИЕ ДАННЫЕ
  @Body() createUserInputModel---имя (createUserInputModel)
  тут я сам создаю  а
  в постмане когда запрос отправляю это обьект с
  данными*/
  async createUser(@Body() createUserInputModel: CreateUserInputModel) {
    const id: string = await this.usersService.createUser(createUserInputModel);

    const user = await this.userQueryRepository.getUserById(id);

    if (user) {
      return user;
    } else {
      throw new NotFoundException('user not found:andpoint-post,url-users');
    }
  }

  @Get()
  async getUsers(@Query() queryParams: UserQueryParams) {
    const users = await this.userQueryRepository.getUsers(queryParams);
    return users;
  }

  /*@Delete(':id')
  --тут id это uriПараметр он в урле и из
    постмана запрос таким будет http://localhost:3000/users/66477c549c39ecbc48a29f70
    айдишку корректную прописывай иначе будет 500 ошибка */

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')

  /*  @Param('id') userId: string---обязательно декоратор добавить
    который определит что это значение из ПАРАМЕТРА а положить значение  из параметра я могу в любую переменную-как
    хочу так и называю*/
  async deleteUserById(@Param('id') userId: string) {
    const isDeleteUserById = await this.usersService.deleteUserById(userId);
    if (isDeleteUserById) {
      return;
    } else {
      throw new NotFoundException(
        'user not found:andpoint-delete,url-users/id',
      );
    }
  }
}

/*
@Get(':id1')
МОЖНО ПАРАМЕТРЫ ПО ДРУГОМУ ПРОПИСАТЬ НО
 ТОГДА НАДО ЧТОБ НАЗВАНИЯ id СОВПАДАЛИ
   getUserById(@Param() params: { id1: string }) {

}*/

/*
ВОЗВРАЩАЕМЫЙ КОД HTTP
ВОТ ТАКОЙ ВАРИАНТ СКАЗАЛИ НЕ ПРАВИЛЬНЫЙ

@Delete(':id')
async deleteUserById(@Param('id') userId: string, @Res() response: Response) {
  const isDeleteUserById = await this.usersService.deleteUserById(userId);
  if (isDeleteUserById) {
    response.status(STATUS_CODE.NO_CONTENT_204).send();
  } else {
    response.status(STATUS_CODE.NOT_FOUND_404).send();
  }}}


  НАДО ВОТ ТАКОЙ ВАРИАНТ!!!
  -@HttpCode(HttpStatus.ACCEPTED)
  или
   @HttpCode(HttpStatus.OK)-чтобы статус код возвращать
    управляемо..только тут прописать
    ЕСЛИ ПО УМОЛЧАНИЮ(не прописывать такой декоратор)
    то код успешный  200
    ........
     @HttpCode(HttpStatus.ACCEPTED)
     @Delete(':id')
async deleteUserById(@Param('id') userId: string, @Res() response: Response) {
  const isDeleteUserById = await this.usersService.deleteUserById(userId);
  if (isDeleteUserById) {
    return
  } else {
    throw new NotFoundException('blog not found');
  }}}

 ------ NotFoundException  эти команды различные
 и в них заложены различные коды  (В ЭТОЙ 404)

  */
