import { useState } from "react";

import Round from "./Round";
import teamStats from "@/scrape/combinedStats.json";

import type { RoundType, MatchupType } from "@/types";

export default function Playoffs({ teams }: { teams: string[] }) {
  const adjustedTeamStats = teams.map((team, i) =>
    Object.assign(teamStats.find((teamStat) => teamStat.name === team)!, { seed: i + 1 }),
  );
  const [rounds, setRounds] = useState<RoundType[]>([
    {
      id: 1,
      matchups: teams.reduce<MatchupType[]>((acc, team, i) => {
        if (i < 8)
          acc.push({
            bottomTeam: teams[i + 8],
            section: "0-0",
            topTeam: team,
            winner: team,
          });
        return acc;
      }, []),
    },
    {
      id: 2,
      matchups: teams.reduce<MatchupType[]>((acc, team, i) => {
        if (i < 4)
          acc.push({
            bottomTeam: teams[7 - i],
            section: "1-0",
            topTeam: team,
            winner: team,
          });
        if (i >= 8 && i < 12)
          acc.push({
            bottomTeam: teams[15 - i + 8],
            section: "0-1",
            topTeam: team,
            winner: team,
          });
        return acc;
      }, []),
    },
    {
      id: 3,
      matchups: teams.reduce<MatchupType[]>((acc, team, i) => {
        if (i < 2)
          acc.push({
            bottomTeam: teams[3 - i],
            section: "2-0",
            topTeam: team,
            winner: team,
          });
        if (i >= 4 && i < 8)
          acc.push({
            bottomTeam: teams[11 - i + 4],
            section: "1-1",
            topTeam: team,
            winner: team,
          });
        if (i >= 12 && i < 14)
          acc.push({
            bottomTeam: teams[15 - i + 12],
            section: "0-2",
            topTeam: team,
            winner: team,
          });
        return acc;
      }, []),
    },
  ]);

  function setResults(id: string, topTeam: string, winner: string | null) {
    const newID = id === "Quarter Finals" ? 1 : id === "Semi Finals" ? 2 : 3;
    const updateRounds: RoundType[] = rounds.map((round) => {
      if (round.id === newID) {
        return {
          id: newID,
          matchups: round.matchups.map((matchup) => {
            if (matchup.topTeam === topTeam) return { ...matchup, winner: winner };
            return matchup;
          }),
        };
      }
      return round;
    });

    setRounds(futureRounds);
  }

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-8">
      {["Quarter Finals", "Semi Finals", "Grand Final"].map((id) => (
        <Round
          key={id}
          id={id}
          matchups={
            rounds.find((round) =>
              id === "Quarter Finals"
                ? round.id === 1
                : id === "Semi Finals"
                  ? round.id === 1
                  : round.id === 3,
            )?.matchups ?? []
          }
          setResults={setResults}
        />
      ))}
    </div>
  );
}
