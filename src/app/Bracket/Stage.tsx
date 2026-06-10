import { useEffect, useState } from "react";

import FinalResults from "./FinalResults";
import Round from "./Round";
import teamStats from "@/scrape/combinedStats.json";

import type { RoundType, MatchupType } from "@/types";

export default function Stage({
  teams,
  setPicks,
  currentStage,
  pickStateRounds,
}: {
  teams: string[];
  setPicks: (arg0: {
    currentStage: number;
    stageRounds: RoundType[];
    stageTeams: string[];
  }) => void;
  currentStage: number;
  pickStateRounds: RoundType[];
}) {
  const adjustedTeamStats = teams.map((team, i) =>
    Object.assign(teamStats.find((teamStat) => teamStat.name === team)!, { seed: i + 1 }),
  );
  const [rounds, setRounds] = useState<RoundType[]>(
    pickStateRounds.length > 0
      ? pickStateRounds
      : [
          {
            id: 1,
            matchups: teams.reduce<MatchupType[]>((acc, team, i) => {
              if (i < 8)
                acc.push({
                  bottomTeam: teams[i + 8],
                  section: "0-0",
                  topTeam: team,
                  winner: null,
                });
              return acc;
            }, []),
          },
          {
            id: 2,
            matchups: [],
          },
          {
            id: 3,
            matchups: [],
          },
          {
            id: 4,
            matchups: [],
          },
          {
            id: 5,
            matchups: [],
          },

          /*
           * Config for pre-defining all matches as top seed winning, rather than showing future rounds only after teams are picked
           * Maybe make this a toggle?
           */

          //   {
          //     id: 2,
          //     matchups: teams.reduce<MatchupType[]>((acc, team, i) => {
          //       if (i < 4)
          //         acc.push({
          //           bottomTeam: teams[7 - i],
          //           section: "1-0",
          //           topTeam: team,
          //           winner: team,
          //         });
          //       if (i >= 8 && i < 12)
          //         acc.push({
          //           bottomTeam: teams[15 - i + 8],
          //           section: "0-1",
          //           topTeam: team,
          //           winner: team,
          //         });
          //       return acc;
          //     }, []),
          //   },
          //   {
          //     id: 3,
          //     matchups: teams.reduce<MatchupType[]>((acc, team, i) => {
          //       if (i < 2)
          //         acc.push({
          //           bottomTeam: teams[3 - i],
          //           section: "2-0",
          //           topTeam: team,
          //           winner: team,
          //         });
          //       if (i >= 4 && i < 8)
          //         acc.push({
          //           bottomTeam: teams[11 - i + 4],
          //           section: "1-1",
          //           topTeam: team,
          //           winner: team,
          //         });
          //       if (i >= 12 && i < 14)
          //         acc.push({
          //           bottomTeam: teams[15 - i + 12],
          //           section: "0-2",
          //           topTeam: team,
          //           winner: team,
          //         });
          //       return acc;
          //     }, []),
          //   },
          //   {
          //     id: 4,
          //     matchups: teams.reduce<MatchupType[]>((acc, team, i) => {
          //       if (i >= 2 && i < 5)
          //         acc.push({
          //           bottomTeam: teams[7 - i + 2],
          //           section: "2-1",
          //           topTeam: team,
          //           winner: team,
          //         });
          //       if (i >= 8 && i < 11)
          //         acc.push({
          //           bottomTeam: teams[13 - i + 8],
          //           section: "1-2",
          //           topTeam: team,
          //           winner: team,
          //         });
          //       return acc;
          //     }, []),
          //   },
          //   {
          //     id: 5,
          //     matchups: [
          //       {
          //         bottomTeam: teams[9],
          //         section: "2-2",
          //         topTeam: teams[5],
          //         winner: teams[5],
          //       },
          //       {
          //         bottomTeam: teams[8],
          //         section: "2-2",
          //         topTeam: teams[6],
          //         winner: teams[6],
          //       },
          //       {
          //         bottomTeam: teams[10],
          //         section: "2-2",
          //         topTeam: teams[7],
          //         winner: teams[7],
          //       },
          //     ],
          //   },
        ],
  );

  useEffect(() => {
    pickStateRounds.map((round) => {
      round.matchups.forEach((matchup) =>
        setResults(String(round.id), matchup.topTeam, matchup.winner),
      );
    });
  }, []);

  function setResults(id: string, topTeam: string, winner: string | null) {
    const updateRounds: RoundType[] = rounds.map((round) => {
      if (round.id === Number(id)) {
        return {
          id: Number(id),
          matchups: round.matchups.map((matchup) => {
            if (matchup.topTeam === topTeam) return { ...matchup, winner: winner };
            return matchup;
          }),
        };
      }
      return round;
    });

    const futureRounds: RoundType[] = updateRounds.map((round) => {
      if (round.id === Number(id) + 1) {
        let sections: ("0-0" | "0-1" | "0-2" | "1-0" | "1-1" | "1-2" | "2-0" | "2-1" | "2-2")[];
        switch (round.id) {
          case 2:
            sections = ["1-0", "0-1"];
            break;
          case 3:
            sections = ["2-0", "1-1", "0-2"];
            break;
          case 4:
            sections = ["2-1", "1-2"];
            break;
          default:
            sections = ["2-2"];
            break;
        }

        const prevResults = teams.map((team) => {
          const wins = updateRounds.reduce((acc, updateRound) => {
            const match = updateRound.matchups.find(
              (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
            );
            if (updateRound.id < round.id && match && match.winner === team) {
              return acc + 1;
            }
            return acc;
          }, 0);

          const losses = updateRounds.reduce((acc, updateRound) => {
            const match = updateRound.matchups.find(
              (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
            );
            if (updateRound.id < round.id && match && match.winner && match.winner !== team) {
              return acc + 1;
            }
            return acc;
          }, 0);

          const buchholzOpp = updateRounds.reduce<string[]>((acc, updateRound) => {
            const match = updateRound.matchups.find(
              (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
            );
            if (updateRound.id < round.id && match && match.winner) {
              acc.push(match.topTeam === team ? match.bottomTeam : match.topTeam);
            }
            return acc;
          }, []);

          return {
            buchholzOpp: buchholzOpp,
            buchholzSelf: wins - losses,
            record: `${wins}-${losses}`,
            team: team,
          };
        });

        const updatedMatchups: MatchupType[][] = [];
        for (const section of sections) {
          const sectionTeams = prevResults
            .filter((result) => result.record === section)
            .sort((a, b) => {
              const seedDiff =
                adjustedTeamStats.find((team) => team.name === a.team)!.seed -
                adjustedTeamStats.find((team) => team.name === b.team)!.seed;

              const buchDiff =
                prevResults.reduce((acc, team) => {
                  if (b.buchholzOpp.includes(team.team)) acc += team.buchholzSelf;
                  return acc;
                }, 0) -
                prevResults.reduce((acc, team) => {
                  if (a.buchholzOpp.includes(team.team)) acc += team.buchholzSelf;
                  return acc;
                }, 0);

              return buchDiff || seedDiff;
            });

          const newMatchups = sectionTeams
            .filter((_, i) => i < Math.floor(sectionTeams.length / 2))
            .map((team) => {
              return {
                bottomTeam: "",
                section: section,
                topTeam: team.team,
                winner: null,
              };
            });

          const bottomTeams = new Set(
            sectionTeams
              .filter((_, i) => i >= Math.floor(sectionTeams.length / 2))
              .map((team) => team.team)
              .toReversed(),
          );

          const tempMatchups: MatchupType[] = [];
          newMatchups.forEach((newMatchup) => {
            let returnBottomTeam = null;
            for (const bottomTeam of bottomTeams) {
              if (
                !sectionTeams
                  .find((team) => team.team === newMatchup.topTeam)!
                  .buchholzOpp.includes(bottomTeam)
              ) {
                bottomTeams.delete(bottomTeam);
                returnBottomTeam = bottomTeam;
                break;
              }
            }
            if (!returnBottomTeam) {
              for (const tempMatchup of tempMatchups.toReversed()) {
                if (
                  !sectionTeams
                    .find((team) => team.team === newMatchup.topTeam)!
                    .buchholzOpp.includes(tempMatchup.bottomTeam)
                ) {
                  returnBottomTeam = tempMatchup.bottomTeam;
                  for (const bottomTeam of bottomTeams) {
                    if (
                      !sectionTeams
                        .find((team) => team.team === tempMatchup.topTeam)!
                        .buchholzOpp.includes(bottomTeam)
                    ) {
                      bottomTeams.delete(bottomTeam);
                      Object.assign(tempMatchup, {
                        bottomTeam: bottomTeam,
                      });
                      break;
                    }
                  }
                  break;
                }
              }
            }

            const oldWinner = rounds
              .find((oldRound) => oldRound.id === round.id)
              ?.matchups.find(
                (matchup) =>
                  matchup.bottomTeam === returnBottomTeam && matchup.topTeam === newMatchup.topTeam,
              )?.winner;

            tempMatchups.push({
              ...newMatchup,
              bottomTeam: returnBottomTeam ?? "",
              winner: oldWinner ?? null,
            });
            return;
          });
          updatedMatchups.push(tempMatchups);
        }
        console.log(round.id, updatedMatchups.flat());

        return {
          id: round.id,
          matchups: updatedMatchups.flat(),
        };
      }
      if (round.id > Number(id) + 1) {
        return {
          id: round.id,
          matchups: [],
        };
      }
      return round;
    });

    setRounds(futureRounds);
    setPicks({ currentStage: currentStage, stageRounds: futureRounds, stageTeams: teams });
  }

  return (
    <div className="grid grid-cols-6 gap-4 md:gap-8">
      {[1, 2, 3, 4, 5].map((id) => (
        <Round
          key={id}
          id={String(id)}
          matchups={rounds.find((round) => round.id === id)?.matchups ?? []}
          setResults={setResults}
        />
      ))}
      <FinalResults
        rounds={rounds}
        teams={rounds
          .find((round) => round.id === 1)!
          .matchups.reduce<string[]>(
            (acc, matchup) => acc.concat([matchup.topTeam, matchup.bottomTeam]),
            [],
          )}
      />
    </div>
  );
}
