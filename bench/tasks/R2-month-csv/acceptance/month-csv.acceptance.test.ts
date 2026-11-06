// 元: routepense #84（bf7906b）の shared/src/csv.test.ts（正しさ。要件定義 F7 に書いてあること）
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
  it("出勤日は通常ルートの1行（往復・金額は片道 × 2）", () => {
    expect(monthCsvRows([record("2026-11-04", commute)])).toEqual([
      ["2026-11-04", "水", "", "出勤", "通常", "A駅", "B駅", "電車", "往復", "220", "440", "自宅↔本社", ""],
    ]);
  });

  it("在宅・休日で追加の移動が無い日は行を作らない", () => {
    expect(monthCsvRows([record("2026-11-05", { kind: "remote" }), record("2026-11-07", { kind: "holiday" })])).toEqual([]);
  });

  it("追加の移動は1件ごとに1行。在宅の日にも付く。ルート名は空、目的を入れる", () => {
    const rows = monthCsvRows([
      record("2026-11-05", { kind: "remote" }, [
        trip({ purpose: "客先B打合せ" }),
        trip({ id: "trip-2", tripType: "roundTrip", transport: "other" }),
      ]),
    ]);
    expect(rows).toEqual([
      ["2026-11-05", "木", "", "在宅", "追加", "B駅", "C駅", "バス", "片道", "160", "160", "", "客先B打合せ"],
      ["2026-11-05", "木", "", "在宅", "追加", "B駅", "C駅", "その他", "往復", "160", "320", "", ""],
    ]);
  });

  it("祝日は祝日名を入れる（勤務区分はそのまま）", () => {
    expect(monthCsvRows([record("2026-11-03", commute)])[0]?.slice(0, 4)).toEqual(["2026-11-03", "火", "文化の日", "出勤"]);
  });

  it("金額の列の和は、月の合計（monthlyFare）と一致する", () => {
    const records = [
      record("2026-11-02", commute, [trip({ tripType: "roundTrip" })]),
      record("2026-11-03", { kind: "holiday" }, [trip()]),
      record("2026-11-04", { kind: "remote" }),
      record("2026-11-05", commute),
    ];
    const sum = monthCsvRows(records).reduce((acc, row) => acc + Number(row[10]), 0);
    expect(sum).toBe(monthlyFare(records).total);
  });
});

describe("escapeCsvField", () => {
  it("カンマ・改行・ダブルクォートが無ければそのまま", () => {
    expect(escapeCsvField("自宅↔本社")).toBe("自宅↔本社");
  });

  it("カンマ・改行を含むと \" で囲む", () => {
    expect(escapeCsvField("A,B")).toBe('"A,B"');
    expect(escapeCsvField("1行目\n2行目")).toBe('"1行目\n2行目"');
    expect(escapeCsvField("A\rB")).toBe('"A\rB"');
  });

  it("中の \" は \"\" に重ねる", () => {
    expect(escapeCsvField('「"本社"」')).toBe('"「""本社""」"');
  });
});

describe("monthCsv", () => {

  it("記録が無い月は見出しだけ", () => {
    expect(monthCsv([])).toBe(`${UTF8_BOM}${CSV_HEADER.join(",")}\r\n`);
  });
});

describe("csvFileName", () => {
  it("routepense-YYYY-MM.csv", () => {
    expect(csvFileName("2026-11")).toBe("routepense-2026-11.csv");
  });
});
