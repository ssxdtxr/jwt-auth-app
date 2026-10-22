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

const registerAndLogin = async () => {
  await request(app).post('/auth/register').send(USER);
  return request(app).post('/auth/login').send(USER);
};

describe('POST /auth/register', () => {
  it('регистрирует нового пользователя и возвращает 201', async () => {
    const res = await request(app).post('/auth/register').send(USER);
    assert.equal(res.status, 201);
    assert.equal(res.body.message, 'Регистрация прошла успешно');
  });

  it('возвращает 400 при отсутствии пароля', async () => {
    const res = await request(app).post('/auth/register').send({ email: USER.email });
    assert.equal(res.status, 400);
  });

  it('возвращает 400 при отсутствии email', async () => {
    const res = await request(app).post('/auth/register').send({ password: USER.password });
    assert.equal(res.status, 400);
  });

  it('возвращает 409 если email уже занят', async () => {
    await request(app).post('/auth/register').send(USER);
    const res = await request(app).post('/auth/register').send(USER);
    assert.equal(res.status, 409);
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => { await request(app).post('/auth/register').send(USER); });

  it('возвращает accessToken и устанавливает cookie при верных данных', async () => {
    const res = await request(app).post('/auth/login').send(USER);
    assert.equal(res.status, 200);
    assert.ok(res.body.accessToken);
    assert.equal(res.body.user.email, USER.email);
    assert.ok(res.headers['set-cookie']);
  });

  it('возвращает 401 при неверном пароле', async () => {
    const res = await request(app).post('/auth/login').send({ ...USER, password: 'wrong' });
    assert.equal(res.status, 401);
  });

  it('возвращает 401 при несуществующем email', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'nobody@test.com', password: 'x' });
    assert.equal(res.status, 401);
  });
});

describe('POST /auth/refresh', () => {
  it('возвращает новый accessToken при валидном refresh cookie', async () => {
    const loginRes = await registerAndLogin();
    const cookie = String(loginRes.headers['set-cookie']);
    const res = await request(app).post('/auth/refresh').set('Cookie', cookie);
    assert.equal(res.status, 200);
    assert.ok(res.body.accessToken);
    assert.equal(res.body.user.email, USER.email);
  });

  it('возвращает 401 без refresh cookie', async () => {
    const res = await request(app).post('/auth/refresh');
    assert.equal(res.status, 401);
  });

  it('возвращает 401 при поддельном refresh cookie', async () => {
    const res = await request(app).post('/auth/refresh').set('Cookie', 'refreshToken=forged.token.here');
    assert.equal(res.status, 401);
  });
});

describe('POST /auth/logout', () => {
  it('инвалидирует refresh token, последующий refresh возвращает 401', async () => {
    const loginRes = await registerAndLogin();
    const cookie = String(loginRes.headers['set-cookie']);
    const logoutRes = await request(app).post('/auth/logout').set('Cookie', cookie);
    assert.equal(logoutRes.status, 200);
    const refreshRes = await request(app).post('/auth/refresh').set('Cookie', cookie);
    assert.equal(refreshRes.status, 401);
  });
});
