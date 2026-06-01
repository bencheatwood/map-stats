import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import type { TeamMapStats, Team, TeamMatchStats, CombinedType, CombinedRank } from "./types";

const combine = () => {
  const ranks = JSON.parse(
    readFileSync(join(import.meta.dirname, "ranks.json"), "utf-8"),
  ) as CombinedRank[];
  const teams = JSON.parse(
    readFileSync(join(import.meta.dirname, "teams.json"), "utf-8"),
  ) as Team[];
  const teamMapStats = JSON.parse(
    readFileSync(join(import.meta.dirname, "mapStats.json"), "utf-8"),
  ) as TeamMapStats[];
  const teamMatchStats = JSON.parse(
    readFileSync(join(import.meta.dirname, "matchStats.json"), "utf-8"),
  ) as TeamMatchStats[];

  const combstats: CombinedType[] = teams.map((team) => {
    const { icon, valve, hltv, name } = ranks.find(
      (rank) => team.name === rank.name.toLowerCase().replace(" ", "-"),
    )!;
    const mapStats = teamMapStats
      .find((teamMap) => team.name === teamMap.name)!
      .stats.filter((stat) => stat.map !== "Train")
      .map((stat) => {
        const record = stat.stats["Wins / draws / losses"].split(" / ");

        return {
          map: stat.map,
          wins: Number(record[0]),
          losses: Number(record[2]),
          winRate: Number(stat.stats["Win rate"].replace("%", "")),
          pick: Number(stat.stats.pick.replace("%", "")),
          ban: Number(stat.stats["Ban %"].replace("%", "")),
        };
      });
    const matchStats = teamMatchStats.find((teamMatch) => team.name === teamMatch.name)!.stats;

    return {
      id: team.id,
      name: name,
      hltv: hltv,
      valve: valve,
      icon: icon,
      mapStats: mapStats,
      matchStats: matchStats,
    };
  });

  writeFileSync(
    join(import.meta.dirname, "combinedStats.json"),
    JSON.stringify(combstats),
    "utf-8",
  );
};

combine();
