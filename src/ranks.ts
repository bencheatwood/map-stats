import { writeFileSync } from "fs";
import { join } from "path";

import { chromium, type Page } from "playwright";

import type { CombinedRank, HLTVRank, Rank } from "./types";

async function getPage(): Promise<Page> {
  const browser = await chromium.connectOverCDP("http://localhost:9222");

  const context = browser.contexts()[0];
  const page = context.pages()[0];

  return page;
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
        name: name,
        rank: rank,
        icon: icon,
      });
    }

    return results;
  });
}

async function getValveRanks(page: Page): Promise<Rank[]> {
  // Official Valve ranking date used for major seeding
  await page.goto(`https://www.hltv.org/valve-ranking/teams/2026/april/6`, {
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
  console.log(hltvRanks);
  const valveRanks = await getValveRanks(page);

  const ranks: CombinedRank[] = hltvRanks.map((h) => {
    console.log(h);
    const vRank = valveRanks.filter((v) => v.name === h.name)[0]?.rank ?? "";
    return { name: h.name, icon: h.icon, hltv: h.rank, valve: vRank };
  });
  writeFileSync(join(import.meta.dirname, "ranks.json"), JSON.stringify(ranks), "utf-8");
}

await scrapeRanks();
