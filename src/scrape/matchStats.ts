import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import { chromium, type Page } from "playwright";

import type { MatchStats, Team, TeamMatchStats } from "../types.ts";

async function getPage(): Promise<Page> {
  const browser = await chromium.connectOverCDP("http://localhost:9222");

  const context = browser.contexts()[0];
  const page = context.pages()[0];

  return page;
}

export async function getResults(page: Page, team: Team): Promise<MatchStats[]> {
  await page.goto(
    `https://www.hltv.org/results?startDate=2026-01-01&endDate=2026-12-31&team=${team.id}`,
    {
      waitUntil: "domcontentloaded",
    },
  );

  await page.waitForSelector('[class="result"]');

  return await page.$$eval('[class="result"]', (matches) => {
    let results: MatchStats[] = [];

    for (const match of matches) {
      const oppName = match
        .querySelector('[class="line-align team2"]')
        ?.querySelector(".team ")?.textContent;
      if (!oppName) continue;

      const resultTD = match.querySelector(".result-score");
      if (!resultTD) continue;

      const spans = resultTD.querySelectorAll("span");
      const won = Number(spans[0]?.textContent) > Number(spans[1]?.textContent);

      if (results.find((result) => result.opponent === oppName)) {
        results = results.map((result) => {
          if (result.opponent === oppName) {
            if (won)
              return {
                ...result,
                wins: result.wins + 1,
                matches: [...result.matches, `${spans[0]?.textContent}-${spans[1]?.textContent}`],
              };
            else
              return {
                ...result,
                losses: result.losses + 1,
                matches: [...result.matches, `${spans[0]?.textContent}-${spans[1]?.textContent}`],
              };
          } else return result;
        });
      } else {
        results.push({
          opponent: oppName,
          wins: won ? 1 : 0,
          losses: won ? 0 : 1,
          matches: [`${spans[0]?.textContent}-${spans[1]?.textContent}`],
        });
      }
    }

    return results;
  });
}

async function scrapeMatchStats() {
  const page = await getPage();

  const teams = JSON.parse(
    readFileSync(join(import.meta.dirname, "teams.json"), "utf-8"),
  ) as Team[];

  const matchStats: TeamMatchStats[] = [];
  for (const team of teams) {
    await new Promise((res) => setTimeout(res, 2000));
    const results = await getResults(page, team);
    matchStats.push({ name: team.name, stats: results });
  }

  writeFileSync(join(import.meta.dirname, "matchStats.json"), JSON.stringify(matchStats), "utf-8");
}

await scrapeMatchStats();
