import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { chromium, type Page } from "playwright";

import type { MapStats, Team, TeamMapStats } from "../types.ts";

async function getPage(): Promise<Page> {
  const browser = await chromium.connectOverCDP("http://localhost:9222");

  const context = browser.contexts()[0];
  const page = context.pages()[0];

  return page;
}

export async function getMapOverview(page: Page, team: Team): Promise<MapStats[]> {
  await page.goto(
    `https://www.hltv.org/stats/teams/maps/${team.id}/${team.name}?startDate=2026-01-01&endDate=2026-12-31`,
    {
      waitUntil: "domcontentloaded",
    },
  );

  await page.waitForSelector(".col");

  return await page.$$eval(".col", (cols) => {
    const results: MapStats[] = [];

    for (const col of cols) {
      const mapPool = col.querySelector('[class="map-pool"]');
      if (!mapPool) continue;

      const mapName = col.querySelector(".map-pool-map-name")?.textContent ?? "";
      const statsRows = col.querySelectorAll(".stats-row");

      const stats: Record<string, string> = {};
      for (const row of statsRows) {
        const spans = row.querySelectorAll("span");

        const key = spans[0]?.textContent;
        const value = spans[1]?.textContent;

        if (!key || !value) continue;
        stats[key] = value;
      }

      results.push({
        map: mapName,
        stats,
      });
    }

    return results;
  });
}

async function scrapeMapStats() {
  const page = await getPage();
  const teams = JSON.parse(
    readFileSync(join(import.meta.dirname, "teams.json"), "utf-8"),
  ) as Team[];

  const mapStats: TeamMapStats[] = [];
  for (const team of teams) {
    await new Promise((res) => setTimeout(res, 2000));
    const results = await getMapOverview(page, team);
    mapStats.push({ name: team.name, stats: results });
  }

  writeFileSync(join(import.meta.dirname, "mapStats.json"), JSON.stringify(mapStats), "utf-8");
}

await scrapeMapStats();
