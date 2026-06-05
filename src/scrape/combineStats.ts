import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import type { TeamMapStats, Team, TeamMatchStats, CombinedType, CombinedRank } from "../types";

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
          ban: Number(stat.stats["Ban %"].replace("%", "")),
          losses: Number(record[2]),
          map: stat.map,
          pick: Number(stat.stats["Pick %"].replace("%", "")),
          winRate: Number(stat.stats["Win rate"].replace("%", "")),
          wins: Number(record[0]),
        };
      });
    const matchStats = teamMatchStats.find((teamMatch) => team.name === teamMatch.name)!.stats;

    return {
      hltv: hltv,
      icon: icon,
      id: team.id,
      mapStats: mapStats,
      matchStats: matchStats,
      name: name,
      valve: valve,
    };
  });

  writeFileSync(
    join(import.meta.dirname, "combinedStats.json"),
    JSON.stringify(combstats),
    "utf-8",
  );
};

combine();
