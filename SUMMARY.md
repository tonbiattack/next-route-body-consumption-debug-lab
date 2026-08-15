# 学習目次

このプロジェクトは、一つのRoute Handler不具合をバグ状態の観測、最小修正、回帰確認の順に追う教材です。

| 章 | 題材 | ガイド | 実装 | テスト |
| --- | --- | --- | --- | --- |
| 第01章 | Request本文の二重消費 | [ガイド](fundamentals/01-route-body-consumption.md) | [`app/api/tasks/[taskId]/route.ts`](app/api/tasks/[taskId]/route.ts) | [`test/task-route.test.ts`](test/task-route.test.ts) |

バグ状態は`262f48f`、修正状態は`34c9f8d`です。バグ状態では不正入力テストが`TypeError`で失敗し、`main`では同じテストが`400`とエラーJSONを確認して成功します。
