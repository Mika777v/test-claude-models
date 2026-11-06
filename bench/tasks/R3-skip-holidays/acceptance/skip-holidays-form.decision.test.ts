// 元: routepense #53（43728b1）の frontend/src/calendar/bulk-form.test.ts で足されたテスト（決め方: 画面側を同じ PR で直し、true を送る）
import type { Route } from "@routepense/shared";
import { describe, expect, it } from "vitest";
import { initialBulkForm, toBulkFormErrors, toBulkPreviewRequest, toggleWeekday } from "./bulk-form";

const route: Route = { id: "r1", userId: "u1", name: "自宅↔本社", from: "中野", to: "東京", transport: "train", oneWayFare: 220 };
describe("toBulkPreviewRequest", () => {
  const base = initialBulkForm("2026-11", [route]);

  it("祝日は除く（チェックを置くまでは、要件定義 F3 の最初の値）", () => {
    expect(toBulkPreviewRequest(base).skipHolidays).toBe(true);
  });
});
