# 公式仕様の調査メモ

## Next.js Route Handlers

Next.js公式ドキュメントは、Route HandlerがWeb標準の`Request`と`Response` APIを使ってカスタムリクエストハンドラーを作る仕組みであると説明している。また、`route.ts`を`app`ディレクトリ内に置き、`request.json()`でリクエスト本文をJSONとして取得できる。

- https://nextjs.org/docs/app/getting-started/route-handlers

## Request.json()

MDNは、`Request.json()`がリクエスト本文を読み取り、JSONテキストをJavaScript値へパースするメソッドだと説明している。本文がdisturbedまたはlockedである場合は`TypeError`が発生する。

- https://developer.mozilla.org/en-US/docs/Web/API/Request/json
