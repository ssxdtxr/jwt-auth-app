import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import request from 'supertest';
import { app } from '../app';
import { AppDataSource, initDb } from '../db/data-source';
import { __resetStore as resetTokens } from '../repositories/token.repository';
import { __resetStore as resetUsers } from '../repositories/user.repository';

const USER = { email: 'user@test.com', password: 'password123' };

before(async () => { await initDb(); });
beforeEach(async () => { await resetTokens(); await resetUsers(); });
after(async () => { await AppDataSource.destroy(); });

const getAccessToken = async (): Promise<string> => {
  await request(app).post('/auth/register').send(USER);
  const res = await request(app).post('/auth/login').send(USER);
  return res.body.accessToken as string;
};

describe('GET /user/me', () => {
  it('возвращает текущего пользователя при валидном токене', async () => {
    const token = await getAccessToken();
    const res = await request(app).get('/user/me').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, USER.email);
  });

  it('возвращает 401 без заголовка Authorization', async () => {
    const res = await request(app).get('/user/me');
    assert.equal(res.status, 401);
  });

  it('возвращает 401 при некорректном токене', async () => {
    const res = await request(app).get('/user/me').set('Authorization', 'Bearer not.a.valid.token');
    assert.equal(res.status, 401);
  });

  it('возвращает 401 при токене с неверной подписью', async () => {
    const jwt = await import('jsonwebtoken');
    const fakeToken = jwt.default.sign({ id: '1', email: USER.email }, 'wrong-secret', { expiresIn: '15m' });
    const res = await request(app).get('/user/me').set('Authorization', `Bearer ${fakeToken}`);
    assert.equal(res.status, 401);
  });
});
