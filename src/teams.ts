import { chromium, type Page } from "playwright";

import type { Team } from "./types";

async function getPage(): Promise<Page> {
  const browser = await chromium.connectOverCDP("http://localhost:9222");

  const context = browser.contexts()[0];
  const page = context.pages()[0];

  return page;
}

async function getMajorTeamIds(page: Page, url: string): Promise<(Team | string)[]> {
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  await page.waitForTimeout(2000);

  const teamIds: Team[] = [];
  await page.$$eval('a[href^="/team/"]', (links) => {
    for (const a of links) {
      const href = a.getAttribute("href");
      const match = href?.split("/");

      if (match) teamIds.push({ id: Number(match[2]), name: match[3] });
    }
  });

  return teamIds;
}

async function scrapeTeams() {
  const url = "https://www.hltv.org/events/8301/iem-cologne-major-2026";
  // https://www.hltv.org/events/9028/iem-cologne-major-2026-stage-1
  // https://www.hltv.org/events/9029/iem-cologne-major-2026-stage-2

  const page = await getPage();

  const teamIds = await getMajorTeamIds(page, url);

  console.log("Team IDs:", teamIds);
}

await scrapeTeams();
