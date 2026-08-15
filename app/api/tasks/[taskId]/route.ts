type TaskUpdateRequest = {
  title?: unknown;
};

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

function readTitle(payload: TaskUpdateRequest): string | null {
  if (typeof payload.title !== "string") {
    return null;
  }

  const title = payload.title.trim();
  return title.length > 0 ? title : null;
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  const { taskId } = await context.params;
  const payload = (await request.json()) as TaskUpdateRequest;
  const title = readTitle(payload);

  if (title === null) {
    const rawBody = await request.text();
    console.warn("更新リクエストのtitleが不正です", { taskId, rawBody });

    return Response.json(
      {
        code: "INVALID_TITLE",
        message: "titleは空でない文字列で指定してください"
      },
      { status: 400 }
    );
  }

  return Response.json(
    {
      id: taskId,
      title
    },
    { status: 200 }
  );
}
