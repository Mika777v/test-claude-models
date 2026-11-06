// 元: routepense #63（e24c438）の backend/src/routes/route-router.test.ts で足されたテスト
import type { ApiError, Route, RouteInput } from "@routepense/shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { startTestServer } from "../test-server";

const input: RouteInput = {
  name: "自宅↔本社",
  from: "A駅",
  to: "B駅",
  transport: "train",
  oneWayFare: 220,
};

describe("/api/routes", () => {
  let server: ReturnType<typeof startTestServer>;
  let url: string;

  beforeEach(() => {
    server = startTestServer();
    url = `${server.baseUrl}/api/routes`;
  });

  afterEach(() => {
    server.close();
  });

  function send(method: string, path: string, body?: unknown, raw?: string) {
    return fetch(`${url}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
    });
  }

  it("経路の URL を付けて登録でき、http(s) でない URL は 400", async () => {
    const searchUrl = "https://example.com/result?from=A&to=B";
    const created = (await (await send("POST", "", { ...input, searchUrl })).json()) as Route;
    expect(created.searchUrl).toBe(searchUrl);
    expect(await (await send("GET", "")).json()).toEqual([created]);

    const res = await send("POST", "", { ...input, searchUrl: "javascript:alert(1)" });
    expect(res.status).toBe(400);
    expect(((await res.json()) as ApiError).fieldErrors?.map((e) => e.field)).toEqual(["searchUrl"]);
  });
});
