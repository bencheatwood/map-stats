import { useEffect, useState } from "react";

import Round from "./Round";
import teamStats from "@/scrape/combinedStats.json";

import type { RoundType, MatchupType } from "@/types";

export default function Playoffs({
  teams,
  setPicks,
  pickStateRounds,
}: {
  teams: string[];
  setPicks: (arg0: {
    currentStage: number;
    stageRounds: RoundType[];
    stageTeams: string[];
  }) => void;
  pickStateRounds: RoundType[];
}) {
  const [rounds, setRounds] = useState<RoundType[]>(
    pickStateRounds.length > 0
      ? pickStateRounds
      : [
          {
            id: 1,
            matchups: teams
              .reduce<MatchupType[]>((acc, team, i) => {
                if (i < 4)
                  acc.push({
                    bottomTeam: teams[7 - i],
                    section: "0-0",
                    topTeam: team,
                    winner: null,
                  });
                return acc;
              }, [])
              .map((match, i, arr) => {
                if (i === 1) return arr[3];
                else if (i === 3) return arr[1];
                else return match;
              }),
          },
          {
            id: 2,
            matchups: [],
          },
          {
            id: 3,
            matchups: [],
          },
        ],
  );

  const adjustedTeamStats = teams.map((team, i) =>
    Object.assign(teamStats.find((teamStat) => teamStat.name === team)!, { seed: i + 1 }),
  );

  useEffect(() => {
    pickStateRounds.forEach((round) => {
      round.matchups.forEach((matchup) => setResults(round.id, matchup.topTeam, matchup.winner));
    });
  }, []);

  function setResults(id: number, topTeam: string, winner: string | null) {
    const updateRounds: RoundType[] = rounds.map((round) => {
      if (round.id === id) {
        return {
          id: id,
          matchups: round.matchups.map((matchup) => {
            if (matchup.topTeam === topTeam) return { ...matchup, winner: winner };
            return matchup;
          }),
        };
      }
      return round;
    });

    const futureRounds: RoundType[] = updateRounds.map((round) => {
      if (round.id === id + 1) {
        let sections: ("0-0" | "0-1" | "0-2" | "1-0" | "1-1" | "1-2" | "2-0" | "2-1" | "2-2")[];
        switch (round.id) {
          case 2:
            sections = ["1-0"];
            break;
          default:
            sections = ["2-0"];
            break;
        }

        const winningTeams = updateRounds
          .find((oldround) => oldround.id === round.id - 1)!
          .matchups.filter((matchup) => matchup.winner)
          .map((matchup) => matchup.winner!);

        const updatedMatchups: MatchupType[][] = [];
        for (const section of sections) {
          const newMatchups =
            round.id === 2
              ? winningTeams.length === 4
                ? [
                    {
                      bottomTeam: winningTeams[1],
                      section: section,
                      topTeam: winningTeams[0],
                      winner: null,
                    },
                    {
                      bottomTeam: winningTeams[3],
                      section: section,
                      topTeam: winningTeams[2],
                      winner: null,
                    },
                  ]
                : []
              : winningTeams.length === 2
                ? [
                    {
                      bottomTeam: winningTeams[1],
                      section: section,
                      topTeam: winningTeams[0],
                      winner: null,
                    },
                  ]
                : [];
          updatedMatchups.push(newMatchups);
        }

        return {
          id: round.id,
          matchups: updatedMatchups.flat(),
        };
      } else if (round.id === id + 2) {
        return {
          id: round.id,
          matchups: [],
        };
      } else return round;
    });

    setRounds(futureRounds);
    setPicks({ currentStage: 4, stageRounds: futureRounds, stageTeams: teams });
  }

  return (
    <div className="grid grid-cols-3 gap-4 md:gap-8">
      {[1, 2, 3].map((id) => (
        <Round
          key={id}
          id={id}
          matchups={rounds.find((round) => round.id === id)?.matchups ?? []}
          setResults={setResults}
          teamStats={adjustedTeamStats}
          playoffs={true}
        />
      ))}
    </div>
  );
}
