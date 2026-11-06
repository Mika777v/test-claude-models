// 元: routepense #84（bf7906b）の shared/src/csv.test.ts（決め方: 並べる順と元の配列を変えないこと・最後の行にも CRLF）
import { describe, expect, it } from "vitest";
import { CSV_HEADER, csvFileName, escapeCsvField, monthCsv, monthCsvRows, UTF8_BOM } from "./csv";
import type { DailyRecord } from "./daily-record";
import type { ExtraTrip } from "./extra-trip";
import { monthlyFare } from "./fare";
import type { WorkStyle } from "./work-style";

const commute: WorkStyle = {
  kind: "commute",
  routeId: "route-1",
  route: { name: "自宅↔本社", from: "A駅", to: "B駅", transport: "train", oneWayFare: 220 },
};

function trip(overrides: Partial<ExtraTrip> = {}): ExtraTrip {
  return { id: "trip-1", from: "B駅", to: "C駅", transport: "bus", oneWayFare: 160, tripType: "oneWay", ...overrides };
}

function record(date: string, workStyle: WorkStyle, extraTrips: ExtraTrip[] = []): Pick<DailyRecord, "date" | "workStyle" | "extraTrips"> {
  return { date, workStyle, extraTrips };
}


describe("monthCsvRows", () => {
  it("同じ日は通常 → 追加の順。日付の順に並べ、元の配列は並べ替えない", () => {
    const records = [record("2026-11-10", commute), record("2026-11-04", commute, [trip()])];
    const rows = monthCsvRows(records);
    expect(rows.map((row) => [row[0], row[4]])).toEqual([
      ["2026-11-04", "通常"],
      ["2026-11-04", "追加"],
      ["2026-11-10", "通常"],
    ]);
    expect(records[0]?.date).toBe("2026-11-10");
  });
});

describe("monthCsv", () => {
  it("BOM・見出し・CRLF の改行で、最後の行にも CRLF が付く", () => {
    const csv = monthCsv([record("2026-11-04", commute, [trip({ purpose: "打合せ, 資料" })])]);
    expect(csv.startsWith(UTF8_BOM)).toBe(true);
    expect(csv.slice(UTF8_BOM.length).split("\r\n")).toEqual([
      CSV_HEADER.join(","),
      "2026-11-04,水,,出勤,通常,A駅,B駅,電車,往復,220,440,自宅↔本社,",
      '2026-11-04,水,,出勤,追加,B駅,C駅,バス,片道,160,160,,"打合せ, 資料"',
      "",
    ]);
  });
});
