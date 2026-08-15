# 設計メモ

## 目的

このプロジェクトは、Next.js Route HandlerでWeb標準の`Request`本文を二重に消費すると、入力エラーをHTTP応答へ変換できなくなることを示します。対象は、`request.json()`の後に`request.text()`を呼ぶ一つの不具合です。

## 実行基盤の選択

Next.js 16.3.1のApp Router構成を使い、`app/api/tasks/[taskId]/route.ts`へRoute Handlerを置きます。Route HandlerはWeb標準の`Request`と`Response`を使うため、Node.js 22が提供する`Request`をテストから直接渡せます。HTTPサーバー、データベース、外部APIを導入せず、本文消費と最終HTTP応答の関係だけを観測します。

Next.jsは`tsconfig.json`に`noEmit`などの設定を加えます。型検査と本番ビルドではこの設定を維持し、テスト実行時だけ`tsc --noEmit false`でJavaScriptを`dist/`へ出力します。これにより、Next.jsの設定を壊さずNode.js標準テストランナーを利用します。

## テスト境界

テストはRoute Handlerを直接呼び、`Request`、Routeパラメータ、`Response`を観測します。不正入力では`400`とエラーJSON、正常入力では`200`と更新結果を確認します。本文を何回読むかという実装詳細は直接アサートせず、二重消費が起きたときに壊れる最終HTTP応答を固定します。

## ログの扱い

修正後は解析済みの`payload`をログに渡します。実運用で入力に個人情報や認証情報が含まれる場合は、`payload`全体の記録を避け、識別子やエラーコードなど必要最小限の情報に絞ります。生の本文が監査または署名検証に必要な場合は、最初に`text()`で一度だけ取得し、その文字列を用途間で再利用します。

## 参考教材との関係

失敗を先に観測してから最小修正と回帰確認を行う手順を採用していますが、既存教材の文章、章名、コードは複製していません。
