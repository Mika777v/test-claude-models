// 元: routepense #63（e24c438）の backend/src/routes/parse-route-input.test.ts で足されたテスト
import { describe, expect, it } from "vitest";
import { parseRouteInput } from "./parse-route-input";

const valid = { name: "自宅↔本社", from: "A駅", to: "B駅", transport: "train", oneWayFare: 220 };

function fields(body: unknown): string[] {
  const result = parseRouteInput(body);
  return result.ok ? [] : result.errors.map((e) => e.field);
}

describe("parseRouteInput（searchUrl）", () => {
  it("経路の URL は任意で、空・null なら付けない", () => {
    expect(parseRouteInput({ ...valid, searchUrl: "" })).toEqual({ ok: true, value: valid });
    expect(parseRouteInput({ ...valid, searchUrl: "   " })).toEqual({ ok: true, value: valid });
    expect(parseRouteInput({ ...valid, searchUrl: null })).toEqual({ ok: true, value: valid });
  });

  it("経路の URL は前後の空白を取り除いて受け取る", () => {
    const searchUrl = "https://roote.ekispert.net/result?dep=A&arr=B";
    expect(parseRouteInput({ ...valid, searchUrl: `  ${searchUrl}  ` })).toEqual({
      ok: true,
      value: { ...valid, searchUrl },
    });
    expect(fields({ ...valid, searchUrl: "http://example.com/" })).toEqual([]);
  });

  it("経路の URL は http:// か https:// で始まるものだけ", () => {
    expect(fields({ ...valid, searchUrl: "javascript:alert(1)" })).toEqual(["searchUrl"]);
    expect(fields({ ...valid, searchUrl: "ftp://example.com/" })).toEqual(["searchUrl"]);
    expect(fields({ ...valid, searchUrl: "example.com" })).toEqual(["searchUrl"]);
    expect(fields({ ...valid, searchUrl: "https://" })).toEqual(["searchUrl"]);
    expect(fields({ ...valid, searchUrl: 1 })).toEqual(["searchUrl"]);
  });

  it("経路の URL は2000文字まで", () => {
    const base = "https://example.com/";
    expect(fields({ ...valid, searchUrl: base + "a".repeat(2000 - base.length) })).toEqual([]);
    expect(fields({ ...valid, searchUrl: base + "a".repeat(2001 - base.length) })).toEqual(["searchUrl"]);
  });

});
