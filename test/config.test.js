import { test } from "node:test";
import assert from "node:assert/strict";

import { API_LOCAL, API_PRODUCAO, escolherApiBase } from "../src/config.js";

test("escolherApiBase prefere o env.js", () => {
  assert.equal(escolherApiBase({ API_BASE_URL: "http://outro:9000" }, "localhost"), "http://outro:9000");
});

test("escolherApiBase sem env.js usa o backend local em localhost", () => {
  assert.equal(escolherApiBase(undefined, "localhost"), API_LOCAL);
  assert.equal(escolherApiBase(undefined, "127.0.0.1"), API_LOCAL);
});

test("escolherApiBase sem env.js usa o Render na página publicada", () => {
  assert.equal(escolherApiBase(undefined, "click-sos-lab-de-software-e-projetos.github.io"), API_PRODUCAO);
});
