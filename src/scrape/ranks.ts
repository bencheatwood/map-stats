import { writeFileSync } from "fs";
import { join } from "path";

import { chromium, type Page } from "playwright";

import type { CombinedRank, HLTVRank, Rank } from "../types";

async function getPage(): Promise<Page> {
  const browser = await chromium.connectOverCDP("http://localhost:9222");

  return browser.contexts()[0].pages()[0];
}

async function getHLTVRanks(page: Page): Promise<HLTVRank[]> {
  // Most recent HLTV week
  await page.goto(`https://www.hltv.org/ranking/teams/2026/may/25`, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector('[class="ranked-team standard-box"]');

  return await page.$$eval('[class="ranked-team standard-box"]', (teams) => {
    let results: HLTVRank[] = [];

    for (const team of teams) {
      const name = team.querySelector(".name ")?.textContent;
      const rank = Number(
        team.querySelector('[class="position wide-position"]')?.textContent.replace("#", ""),
      );
      const icon = team.querySelector(".team-logo img")?.getAttribute("src");
      if (!name || !rank || !icon) continue;

      results.push({
        icon: icon,
        name: name,
        rank: rank,
      });
    }

    return results;
  });
}

async function getValveRanks(page: Page): Promise<Rank[]> {
  // Official Valve ranking date used for major seeding
  await page.goto(`https://www.hltv.org/valve-ranking/teams/2026/may/4`, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector('[class="ranked-team standard-box"]');

  return await page.$$eval('[class="ranked-team standard-box"]', (teams) => {
    let results: Rank[] = [];

    for (const team of teams) {
      const name = team.querySelector(".name ")?.textContent;
      const rank = Number(
        team.querySelector('[class="position wide-position"]')?.textContent.replace("#", ""),
      );
      if (!name || !rank) continue;

      results.push({
        name: name,
        rank: rank,
      });
    }

    return results;
  });
}

async function scrapeRanks() {
  const page = await getPage();
  const hltvRanks = await getHLTVRanks(page);
  const valveRanks = await getValveRanks(page);

  const ranks: CombinedRank[] = hltvRanks.map((h) => {
    const vRank = valveRanks.find((v) => v.name === h.name)?.rank ?? NaN;
    return { hltv: h.rank, icon: h.icon, name: h.name, valve: vRank };
  });
  writeFileSync(join(import.meta.dirname, "ranks.json"), JSON.stringify(ranks), "utf-8");
}

await scrapeRanks();
