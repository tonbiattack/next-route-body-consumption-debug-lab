# Route HandlerでRequest本文を二重に消費する不具合のデバッグ記録

## 対象の不具合

`PATCH /api/tasks/[taskId]`は、空白だけの`title`を受け取った場合に`400`とエラーJSONを返す契約です。バグ状態では、`request.json()`で入力を検証した後、ログのために`request.text()`を呼びました。その結果、`Response.json()`に到達する前に`TypeError`が発生し、API利用者は契約どおりの`400`を受け取れませんでした。

| 項目 | 期待値 | バグ状態での実際値 |
| --- | --- | --- |
| 不正`title`へのステータス | `400` | Responseが返らず`TypeError` |
| 不正`title`への本文 | `INVALID_TITLE`のエラーJSON | Responseが返らない |
| 有効`title`へのステータス | `200` | `200` |
| 本文の読み取り | 一度 | `json()`の後に`text()`を実行 |

## 再現条件

バグを含むコミットは`262f48f`です。

```bash
git checkout 262f48f
npm install
npm run test:chapter-01
```

実行時の観測結果は次のとおりです。

```text
not ok 1 - 第01章: titleが空ならRoute Handlerは400とエラーJSONを返す
  failureType: 'testCodeFailure'
  error: 'Body is unusable: Body has already been read'
  code: 'ERR_TEST_FAILURE'
  name: 'TypeError'
```

同じ実行では、有効な`title`に対する正常系テストは成功しました。

## 調査

| 確認対象 | 観測結果 | 判断 |
| --- | --- | --- |
| 入力 | `{ "title": "   " }` | JSONとしては正しく、業務検証まで到達している |
| 最初の本文処理 | `request.json()`が成功 | JSON解析自体は原因ではない |
| 不正入力分岐 | `request.text()`を実行 | 同じRequest本文の再読を試みている |
| 最終状態 | `Response.json()`より前に`TypeError` | `400`を返せない直接原因 |
| 正常系 | `200`と更新結果を返す | 不具合は不正入力の分岐に限定される |
| Next.jsビルド | 成功 | ルート定義・型設定の失敗ではない |

## 原因

Next.jsのRoute HandlerはWeb標準の`Request` APIを使います。`Request.json()`は本文を読み取り、本文がdisturbedまたはlockedの場合は`TypeError`になります。Next.js公式ドキュメントとMDNの根拠は[公式仕様メモ](reference-notes.md)に記録しています。

## 修正

修正コミットは`34c9f8d`です。`request.text()`を削除し、すでに解析済みの`payload`をログに渡すよう変更しました。

```ts
console.warn("更新リクエストのtitleが不正です", { taskId, payload });
```

これにより、本文を一度だけ消費し、`Response.json()`で`400`とエラーJSONを返せます。

## 回帰確認

```bash
git switch main
npm run typecheck
npm run test:chapter-01
npm test
npm run build
```

修正後は型検査、対象テスト、全テスト、Next.js本番ビルドが成功しました。回帰テストは、変更対象である不正入力時の最終HTTP応答と、保持対象である正常入力の更新結果を両方確認します。

## 設計上の制約

修正後のサンプルは解析済みの`payload`をログに出します。実APIで個人情報や秘密情報を受け取る場合は、ログ出力を最小限にし、入力全体を出力しない設計が必要です。生の本文が必要な処理では、`text()`で一度だけ取得し、その文字列を用途間で再利用します。
