import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import request from 'supertest';

describe('tests for andpoint auth/login', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /*  ДЛЯ ТЕСТА  НАДО 
  -- запустить тест РЕГИСТРАЦИИ
  -- потом ВЗЯТЬ ИЗ БАЗЫ ДАННЫХ
  confirmationCode
  "26e24b65-b7ce-410e-bb08-febe06e9674e"

  напомню что имеется время протухания поэтому
  надо сделать регистрацию и потом подтверждение с
  новым-свежим кодом*/
  it('registration-confirmation  user', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: '54dd3296-f304-412b-9c6b-a97ccb6a257d',
      })
      .expect(204);
  });
});
