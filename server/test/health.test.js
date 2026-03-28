const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.DATABASE_URL ||= "postgresql://postgres:postgres@localhost:5432/notas_saas?schema=public";
process.env.JWT_SECRET ||= "test-secret";
process.env.CLIENT_URL ||= "http://localhost:5173";

const app = require("../src/app");

test("GET /api/health returns ok status", async () => {
  const response = await request(app).get("/api/health");

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.status, "ok");
  assert.ok(response.body.timestamp);
});

test("GET /api/groups without token returns 401", async () => {
  const response = await request(app).get("/api/groups");

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.message, "Token no proporcionado");
});
