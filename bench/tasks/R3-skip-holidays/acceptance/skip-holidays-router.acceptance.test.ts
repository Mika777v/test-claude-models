// 元: routepense #53（43728b1）の backend/src/daily-records/bulk-router.test.ts で足されたテスト（正しさ）
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
    it("祝日を除くと、祝日（11/3 文化の日）は当てはめず、その日の記録も上書きしない", async () => {
      await send("PUT", "/daily-records/2026-11-03", { workStyle: { kind: "holiday" } });

      const res = await send("POST", "/daily-records/bulk/preview", {
        startDate: "2026-11-01",
        endDate: "2026-11-08",
        weekdays: WEEKDAYS,
        skipHolidays: true,
        workStyle: { kind: "remote" },
      });
      expect(res.status).toBe(200);
      const preview = (await res.json()) as BulkApplyResult;
      expect(preview.records.map((r) => r.date)).toEqual(["2026-11-02", "2026-11-04", "2026-11-05", "2026-11-06"]);
      expect(preview.overwrittenDates).toEqual([]);
    });
  });
});
