import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import request from 'supertest';
import { UserManagerForTest } from '../utils/user-manager-for-test';

describe('tests for andpoint auth/login', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    await app.init();

    //для очистки базы данных
    await request(app.getHttpServer()).delete('/testing/all-data');
  });

  afterAll(async () => {
    await app.close();
  });

  it('login  user', async () => {
    const userManagerForTest = new UserManagerForTest(app);

    const login1 = 'login1';

    const password1 = 'password1';

    await userManagerForTest.createUser(login1, password1, 'email@ema.com');

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: login1,
        password: password1,
      })
      .expect(200);

    //console.log(res.body);

    expect(res.body).toHaveProperty('accessToken');
  });
});
