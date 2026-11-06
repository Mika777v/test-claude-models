// 元: routepense #53（43728b1）の shared/src/bulk.test.ts で足されたテスト
import { describe, expect, it } from "vitest";
import { bulkTargetDates } from "./bulk";
import type { Weekday } from "./date";

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5];
const EVERY_DAY: Weekday[] = [0, 1, 2, 3, 4, 5, 6];
describe("bulkTargetDates", () => {
  describe("祝日を除く（skipHolidays）", () => {
    // 2026年11月の祝日: 11/3（火）文化の日、11/23（月）勤労感謝の日
    const november = { startDate: "2026-11-01", endDate: "2026-11-30", weekdays: WEEKDAYS };

    it("true なら、曜日が合っても祝日を除く", () => {
      const dates = bulkTargetDates({ ...november, skipHolidays: true });
      expect(dates).not.toContain("2026-11-03");
      expect(dates).not.toContain("2026-11-23");
      expect(dates).toHaveLength(19); // 平日21日 − 祝日2日
    });

    it("false なら、祝日も含める", () => {
      const dates = bulkTargetDates({ ...november, skipHolidays: false });
      expect(dates).toContain("2026-11-03");
      expect(dates).toHaveLength(21);
    });

    it("振替休日も除く（日曜の祝日は、曜日の条件でもともと入らない）", () => {
      // 2026-05-03（日）憲法記念日。振替休日の 5/6（水）は平日なので、true なら除く
      const may = { startDate: "2026-05-01", endDate: "2026-05-08", weekdays: WEEKDAYS };
      expect(bulkTargetDates({ ...may, skipHolidays: true })).toEqual(["2026-05-01", "2026-05-07", "2026-05-08"]);
      expect(bulkTargetDates({ ...may, skipHolidays: false })).toEqual([
        "2026-05-01",
        "2026-05-04",
        "2026-05-05",
        "2026-05-06",
        "2026-05-07",
        "2026-05-08",
      ]);
    });

    it("一覧に無い年は、祝日が無いものとして除かない", () => {
      // 2028-01-01（土）は元日だが、一覧に 2028年 はまだ無い
      expect(
        bulkTargetDates({ startDate: "2028-01-01", endDate: "2028-01-01", weekdays: [6], skipHolidays: true }),
      ).toEqual(["2028-01-01"]);
    });
  });
});
