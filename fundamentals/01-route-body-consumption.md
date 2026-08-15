# 第01章: Route HandlerでRequest本文を二重に消費する

## 目的

Next.jsのRoute Handlerで`request.json()`を呼んだ後に`request.text()`を呼ぶと、すでに消費済みの本文を再読しようとして例外になります。不正入力に対する最終HTTP応答を確認し、本文を一度だけ読み取る実装へ修正します。

## Red: 最初のテスト

空白だけの`title`に対し、例外ではなく`400`とエラーJSONを返すことを固定します。正常入力では`200`とトリミング済みのタイトルを返すことも確認します。

```ts
const response = await PATCH(createPatchRequest({ title: "   " }), {
  params: Promise.resolve({ taskId: "task-001" })
});

assert.equal(response.status, 400);
assert.deepEqual(await response.json(), {
  code: "INVALID_TITLE",
  message: "titleは空でない文字列で指定してください"
});
```

```bash
git checkout 262f48f
npm install
npm run test:chapter-01
```

この状態では、`request.json()`の後に`request.text()`が実行されます。`400`のResponseを作る前に`Body is unusable: Body has already been read`という`TypeError`が発生し、不正入力テストが失敗します。

## Green: 最小修正

完成実装は[`app/api/tasks/[taskId]/route.ts`](../app/api/tasks/[taskId]/route.ts)にあります。最初に解析した`payload`をログにも再利用し、`request.text()`を削除します。

```ts
if (title === null) {
  console.warn("更新リクエストのtitleが不正です", { taskId, payload });

  return Response.json(
    {
      code: "INVALID_TITLE",
      message: "titleは空でない文字列で指定してください"
    },
    { status: 400 }
  );
}
```

```bash
git switch main
npm run typecheck
npm run test:chapter-01
npm test
npm run build
```

修正後は、本文を一度だけ読み取り、空白だけの`title`には`400`とエラーJSONを返します。正常な更新結果も維持されます。

## 次に増やす振る舞い

次は、JSON構文エラーを`400`へ変換するテストや、本文を一度だけ`text()`で取得して署名検証とJSON解析に再利用する設計を追加できます。ログの内容に機微情報を含めないことも、別の契約としてテストと設計に反映します。
