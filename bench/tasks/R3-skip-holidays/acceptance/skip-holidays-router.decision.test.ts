// 元: routepense #53（43728b1）の backend/src/daily-records/bulk-router.test.ts で足されたテスト（決め方: 項目が無いときは 400 = 必須にした）
import type {
  ApiError,
  BulkApplyResult,
  DailyRecord,
  ExtraTrip,
  Route,
  RouteInput,
} from "@routepense/shared";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { startTestServer } from "../test-server";

const routeInput: RouteInput = {
  name: "自宅↔本社",
  from: "A駅",
  to: "B駅",
  transport: "train",
  oneWayFare: 220,
};

const WEEKDAYS = [1, 2, 3, 4, 5];

describe("/api/daily-records/bulk", () => {
  let server: ReturnType<typeof startTestServer>;
  let route: Route;

  beforeEach(async () => {
    server = startTestServer();
    route = (await (await send("POST", "/routes", routeInput)).json()) as Route;
  });

  afterEach(() => {
    server.close();
  });

  function send(method: string, path: string, body?: unknown) {
    return fetch(`${server.baseUrl}/api${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  async function fieldsOf(res: Response): Promise<string[] | undefined> {
    return ((await res.json()) as ApiError).fieldErrors?.map((e) => e.field);
  }

  async function listNovember(): Promise<DailyRecord[]> {
    return (await (await send("GET", "/daily-records?month=2026-11")).json()) as DailyRecord[];
  }

  describe("POST /bulk/preview（下見）", () => {
    it("祝日を除くかが無い・true / false でないと 400", async () => {
      const base = { startDate: "2026-11-01", endDate: "2026-11-30", weekdays: WEEKDAYS, workStyle: { kind: "remote" } };

      const missing = await send("POST", "/daily-records/bulk/preview", base);
      expect(missing.status).toBe(400);
      expect(await fieldsOf(missing)).toEqual(["skipHolidays"]);

      const notBoolean = await send("POST", "/daily-records/bulk/preview", { ...base, skipHolidays: "true" });
      expect(await fieldsOf(notBoolean)).toEqual(["skipHolidays"]);
    });
  });
});
