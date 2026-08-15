import assert from "node:assert/strict";
import test from "node:test";

import { PATCH } from "../app/api/tasks/[taskId]/route.js";

function createPatchRequest(body: unknown): Request {
  return new Request("http://localhost/api/tasks/task-001", {
    method: "PATCH",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

test("第01章: titleが空ならRoute Handlerは400とエラーJSONを返す", async () => {
  const response = await PATCH(createPatchRequest({ title: "   " }), {
    params: Promise.resolve({ taskId: "task-001" })
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    code: "INVALID_TITLE",
    message: "titleは空でない文字列で指定してください"
  });
});

test("第01章: titleが有効ならRoute Handlerは更新結果を返す", async () => {
  const response = await PATCH(createPatchRequest({ title: "  設計レビュー  " }), {
    params: Promise.resolve({ taskId: "task-001" })
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    id: "task-001",
    title: "設計レビュー"
  });
});
