# Next.js Route Body Consumption Debug Lab

Next.js App RouterのRoute Handlerで`request.json()`の後に`request.text()`を呼び、リクエスト本文を二重に消費したため、入力エラーに`400`を返せなくなる不具合を再現・修正するTypeScriptプロジェクトです。

## APIの契約

対象のAPIは`PATCH /api/tasks/[taskId]`です。`title`が空白だけの場合は`400`とエラーJSONを返し、有効な`title`の場合は`200`と更新結果を返します。

| 入力 | 期待するHTTP応答 |
| --- | --- |
| `{ "title": "   " }` | `400`、`INVALID_TITLE`のエラーJSON |
| `{ "title": "  設計レビュー  " }` | `200`、トリミング済みのタスクJSON |

## 必要環境

Node.js 22以降とnpmを使用します。プロジェクトはNext.js 16.3.1とTypeScriptで構成し、テストはNode.js標準テストランナーで実行します。

## 実行方法

```bash
npm install
npm run typecheck
npm test
npm run build
```

Route Handlerの対象テストだけを実行する場合は、次のコマンドを使います。

```bash
npm run test:chapter-01
```

## バグを再現する

バグ状態は`262f48f`です。不正な`title`に対して、`request.json()`で本文を解析した後、ログ用途で`request.text()`を再び呼びます。そのため`400`のResponseを作る前に`TypeError`が発生します。

```bash
git checkout 262f48f
npm install
npm run test:chapter-01
```

期待する失敗は`Body is unusable: Body has already been read`です。有効な`title`に対する正常系テストは成功します。

## 修正後を確認する

修正は`34c9f8d`です。最初に取得した`payload`をログにも再利用し、本文を一度だけ消費するようにしました。

```bash
git switch main
npm run typecheck
npm test
npm run build
```

## 学習資料

| 文書 | 内容 |
| --- | --- |
| [第01章のガイド](fundamentals/01-route-body-consumption.md) | RedからGreenまでの観測手順 |
| [デバッグ記録](docs/debugging-record.md) | 実行結果、原因、修正、制約 |
| [公式仕様メモ](docs/reference-notes.md) | Next.jsとWeb Request APIの根拠 |
| [設計メモ](DESIGN.md) | テスト境界と本文処理の設計判断 |
| [対応表](coverage-matrix.md) | 実装済み・未着手テーマの一覧 |

## 参考資料

Route Handlerが標準のWeb Request APIを使うことは[Next.js公式ドキュメント](https://nextjs.org/docs/app/getting-started/route-handlers)、`Request.json()`が本文を読み取ることと消費済み本文での`TypeError`は[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Request/json)を参照してください。
