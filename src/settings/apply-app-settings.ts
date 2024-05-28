import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ErrorResponseType, HttpExceptionFilter } from '../exeption-filter';

export const applyAppSettings = (app: INestApplication) => {
  app.enableCors();
  /*ДЛЯ СОЗДАНИЯ ГЛОБАЛЬНОГО ПАЙПА
  КОД В АРГУМЕНТЕ --это чтоб если pipe валидация
  не прошла то выводилась ошибка определенного
  формата---поле конкретное и текст всех
  ошибок для этого поля*/
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const errorForResponse: ErrorResponseType[] = [];
        errors.forEach((e: ValidationError) => {
          const constraintsKey = Object.keys(e.constraints ?? {});
          /*constraints это {isEmail: 'name must be an email', isLength: 'Short length поля name'}
           * --и создаётся массив ключей[isEmail,isLength]*/

          constraintsKey.forEach((ckey: string) => {
            errorForResponse.push({
              message: e.constraints?.[ckey] ?? 'default message',
              field: e.property,
            });
          });
        });
        throw new BadRequestException(errorForResponse);
      },
    }),
  );

  /*https://docs.nestjs.com/exception-filters
 
   Exception filters
   -он в файле exception-filter.ts
 
 ---ЭТО ПЕРЕХВАТ ЛЮБОГО HTTP кода ошибки
 
 --тут  ГЛОБАЛЬНО ПОДКЛЮЧаю К ПРИЛОЖЕНИЮ*/
  app.useGlobalFilters(new HttpExceptionFilter());
};
