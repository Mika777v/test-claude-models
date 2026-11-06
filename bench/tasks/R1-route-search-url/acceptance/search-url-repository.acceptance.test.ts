// 元: routepense #63（e24c438）の backend/src/routes/sqlite-route-repository.test.ts で足されたテスト
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { RouteInput } from "@routepense/shared";
import { beforeEach, describe, expect, it } from "vitest";
import { openDatabase } from "../db/database";
import { migrations } from "../db/migrations";
import { SqliteRouteRepository } from "./sqlite-route-repository";

const input: RouteInput = {
  name: "自宅↔本社",
  from: "A駅",
  to: "B駅",
  transport: "train",
  oneWayFare: 220,
};

describe("SqliteRouteRepository", () => {
  let db: DatabaseSync;
  let repo: SqliteRouteRepository;
  let tick: number;

  beforeEach(() => {
    db = openDatabase(":memory:");
    // 登録した順に並ぶことを確かめるため、時刻を1秒ずつ進める
    tick = 0;
    repo = new SqliteRouteRepository(db, () => new Date(Date.UTC(2026, 10, 1, 0, 0, tick++)));
  });

  it("経路の URL を保存・変更・消去できる。URL が無いときは項目ごと無い", () => {
    const searchUrl = "https://example.com/result?from=A&to=B";
    const created = repo.create("user-1", { ...input, searchUrl });
    expect(repo.get("user-1", created.id)?.searchUrl).toBe(searchUrl);

    repo.update("user-1", created.id, { ...input, searchUrl: `${searchUrl}&v=2` });
    expect(repo.get("user-1", created.id)?.searchUrl).toBe(`${searchUrl}&v=2`);

    repo.update("user-1", created.id, input);
    const cleared = repo.get("user-1", created.id);
    expect(cleared).toEqual({ id: created.id, userId: "user-1", ...input });
    expect(cleared && "searchUrl" in cleared).toBe(false);
  });
});

describe("openDatabase（searchUrl の列）", () => {
  it("URL の列が無い古い DB のルートも、マイグレーションの後にそのまま読める", () => {
    const dir = mkdtempSync(join(tmpdir(), "routepense-"));
    const file = join(dir, "old.db");
    try {
      // version 2 までの DB を作り、その時点の列だけでルートを入れる
      const old = new DatabaseSync(file);
      for (const m of migrations.filter((m) => m.version <= 2)) old.exec(m.sql);
      old.exec("PRAGMA user_version = 2");
      old
        .prepare(
          `INSERT INTO routes (id, user_id, name, from_place, to_place, transport, one_way_fare, created_at, updated_at)
           VALUES ('r1', 'user-1', '自宅↔本社', 'A駅', 'B駅', 'train', 220, 'x', 'x')`,
        )
        .run();
      old.close();

      const db = openDatabase(file);
      expect(new SqliteRouteRepository(db).list("user-1")).toEqual([{ id: "r1", userId: "user-1", ...input }]);
      db.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
