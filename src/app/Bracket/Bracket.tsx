import { Info } from "lucide-react";
import { useEffect, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "#ui/accordion";
import { Badge } from "#ui/badge";
import { Button } from "#ui/button";
import { Item, ItemContent, ItemMedia, ItemTitle } from "#ui/item";
import { Popover, PopoverContent, PopoverHeader, PopoverTrigger } from "#ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#ui/table";

import teamStats from "@/scrape/combinedStats.json";

import type { CombinedType, Matchup, Round } from "@/types";

const mapNames = ["Ancient", "Anubis", "Dust2", "Inferno", "Mirage", "Nuke", "Overpass"];

// TO-DO:
// - Make stage a parameter chosen from tabs
// - Carry over Buchholz seeding to automatically sort final results
//     - These are manually sorted by Stage 1 results
const stage1Teams = ["B8", "BetBoom", "GamerLegion", "M80", "MIBR", "TYLOO", "BIG", "FlyQuest"];

const stage2Teams = ["Spirit", "Astralis", "G2", "FUT", "Legacy", "paiN", "9z", "Monte"]
  .sort(
    (a, b) =>
      teamStats.find((team) => team.name === a)!.valve -
      teamStats.find((team) => team.name === b)!.valve,
  )
  .concat(stage1Teams);

// Append seeding (this is VRS ranking in Stage 1)
const adjustedTeamStats = stage2Teams.map((team, i) =>
  Object.assign(teamStats.find((teamStat) => teamStat.name === team)!, { seed: i + 1 }),
);

export default function Bracket() {
  const [rounds, setRounds] = useState<Round[]>([
    {
      id: 1,
      matchups: stage2Teams.reduce<Matchup[]>((acc, team, i) => {
        if (i < 8)
          acc.push({ bottomTeam: stage2Teams[i + 8], section: "0-0", topTeam: team, winner: null });
        return acc;
      }, []),
    },
    {
      id: 2,
      matchups: [] as Matchup[],
    },
    {
      id: 3,
      matchups: [] as Matchup[],
    },
    {
      id: 4,
      matchups: [] as Matchup[],
    },
    {
      id: 5,
      matchups: [] as Matchup[],
    },
  ]);

  // TO-DO: Reset results for following round of match result changed when more than two rounds are shown
  function setResults(id: number, topTeam: string, winner: string | null) {
    const updateRounds: Round[] = rounds.map((round) => {
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

    const futureRounds: Round[] = updateRounds.map((round) => {
      if (round.id > id) {
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

        const prevResults = stage2Teams.map((team) => {
          const wins = updateRounds.reduce((acc, updateRound) => {
            const match = updateRound.matchups.find(
              (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
            );
            if (updateRound.id <= id && match && match.winner === team) {
              return acc + 1;
            }
            return acc;
          }, 0);

          const losses = updateRounds.reduce((acc, updateRound) => {
            const match = updateRound.matchups.find(
              (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
            );
            if (updateRound.id <= id && match && match.winner && match.winner !== team) {
              return acc + 1;
            }
            return acc;
          }, 0);

          const buchholzOpp = updateRounds.reduce<string[]>((acc, updateRound) => {
            const match = updateRound.matchups.find(
              (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
            );
            if (updateRound.id <= id && match && match.winner) {
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

        const updatedMatchups: Matchup[][] = [];
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

          let bottomTeams: string[] = [];
          const newMatchups = sectionTeams.map((team, i) => {
            if (i < Math.floor(sectionTeams.length / 2)) {
              return {
                bottomTeam: "",
                section: section,
                topTeam: team.team,
                winner: null,
              };
            } else bottomTeams.push(team.team);
          });
          bottomTeams.reverse();
          const tempMatchups: Matchup[] = [];
          for (const newMatchup of newMatchups) {
            if (!newMatchup) continue;
            const newBottomTeam = bottomTeams.find(
              (bottomTeam) =>
                !sectionTeams
                  .find((team) => team.team === newMatchup.topTeam)!
                  .buchholzOpp.includes(bottomTeam),
            );
            tempMatchups.push({
              ...newMatchup,
              bottomTeam: newBottomTeam!,
            });
            bottomTeams = bottomTeams.filter((bottomTeam) => bottomTeam !== newBottomTeam);
          }
          updatedMatchups.push(tempMatchups);
        }

        return {
          id: round.id,
          matchups: updatedMatchups.flat(),
        };
      }
      return round;
    });

    setRounds(futureRounds);
  }

  return (
    <div className="grid grid-cols-6 gap-4 md:gap-8">
      {[1, 2, 3, 4, 5].map((id) => (
        <Round
          key={id}
          id={id}
          matchups={rounds.find((round) => round.id === id)?.matchups ?? []}
          setResults={setResults}
        />
      ))}
      <FinalResults rounds={rounds} />
    </div>
  );
}

function Round({
  id,
  matchups,
  setResults,
}: {
  id: number;
  matchups: Matchup[];
  setResults: (arg0: number, arg1: string, arg2: string | null) => void;
}) {
  let sections: ("0-0" | "0-1" | "0-2" | "1-0" | "1-1" | "1-2" | "2-0" | "2-1" | "2-2")[];
  // TO-DO: Decide on making an empty placeholder bracket or revert to showing rounds only as they are finished
  let shown = true;
  switch (id) {
    case 1:
      sections = ["0-0"];
      // shown = true;
      break;
    case 2:
      sections = ["1-0", "0-1"];
      // shown = matchups.length === 8;
      break;
    case 3:
      sections = ["2-0", "1-1", "0-2"];
      // shown = matchups.length === 8;
      break;
    case 4:
      sections = ["2-1", "1-2"];
      // shown = matchups.length === 6;
      break;
    default:
      sections = ["2-2"];
      // shown = matchups.length === 3;
      break;
  }
  return (
    shown && (
      <div className="h-full w-full min-w-15">
        <div className="mb-4 text-center text-lg md:text-2xl">{`Round ${id}`}</div>
        <div className="h-full place-content-center space-y-8">
          {sections.map((section) => (
            <div key={section} className="space-y-4 rounded-lg border p-2">
              <div className="text-center text-xl">{section}</div>
              {matchups.map(
                (matchup, i) =>
                  matchup.section === section && (
                    <Matchup
                      key={i}
                      topTeam={matchup.topTeam}
                      bottomTeam={matchup.bottomTeam}
                      id={id}
                      setResults={setResults}
                    />
                  ),
              )}
            </div>
          ))}
        </div>
      </div>
    )
  );
}

function Matchup({
  topTeam,
  bottomTeam,
  id,
  setResults,
}: {
  topTeam: string;
  bottomTeam: string;
  id: number;
  setResults: (arg0: number, arg1: string, arg2: string | null) => void;
}) {
  const [topStats, setTopStats] = useState<CombinedType | undefined>();
  const [bottomStats, setBottomStats] = useState<CombinedType | undefined>();
  const [selectTopTeam, setSelectTopTeam] = useState<boolean>(false);
  const [selectBottomTeam, setSelectBottomTeam] = useState<boolean>(false);

  useEffect(() => {
    if (topTeam === "" || bottomTeam === "") return;
    const tempTopStats = teamStats.find((team) => team.name === topTeam);
    const tempBottomStats = teamStats.find((team) => team.name === bottomTeam);
    if (!tempTopStats || !tempBottomStats) return;
    for (const mapName of mapNames) {
      if (!tempTopStats.mapStats.find((stat) => stat.map === mapName)) {
        tempTopStats.mapStats.push({
          ban: 100,
          losses: 0,
          map: mapName,
          pick: 0,
          winRate: 0,
          wins: 0,
        });
      }
      if (!tempBottomStats.mapStats.find((stat) => stat.map === mapName)) {
        tempBottomStats.mapStats.push({
          ban: 100,
          losses: 0,
          map: mapName,
          pick: 0,
          winRate: 0,
          wins: 0,
        });
      }
    }
    setTopStats(tempTopStats);
    setBottomStats(tempBottomStats);
  }, [topTeam, bottomTeam]);

  return (
    <div className="md:flex">
      <div className="w-full min-w-10.5 space-y-1">
        <Item
          variant="outline"
          className={`w-full cursor-pointer flex-nowrap select-none ${selectTopTeam ? "bg-green-700/80 hover:bg-green-700/60 " : "bg-accent hover:bg-accent/80 "}`}
          onClick={() => {
            setSelectTopTeam(!selectTopTeam);
            if (selectBottomTeam) setSelectBottomTeam(false);
            setResults(id, topTeam, !selectTopTeam ? topTeam : null);
          }}
        >
          <ItemMedia>
            <img src={topStats?.icon} className="size-4" />
          </ItemMedia>
          <ItemContent className="hidden truncate lg:block">{topTeam}</ItemContent>
        </Item>
        <Item
          variant="outline"
          className={`w-full min-w-10.5 cursor-pointer flex-nowrap select-none ${selectBottomTeam ? "bg-green-700/80 hover:bg-green-700/60 " : "bg-accent hover:bg-accent/80 "}`}
          onClick={() => {
            setSelectBottomTeam(!selectBottomTeam);
            if (selectTopTeam) setSelectTopTeam(false);
            setResults(id, topTeam, !selectBottomTeam ? bottomTeam : null);
          }}
        >
          <ItemMedia>
            <img src={bottomStats?.icon} className="size-4" />
          </ItemMedia>
          <ItemContent className="hidden truncate lg:block">{bottomTeam}</ItemContent>
        </Item>
      </div>
      {topStats && bottomStats && (
        <Popover>
          <PopoverTrigger
            className="my-1 h-9.5 w-full md:my-auto md:ml-2 md:w-6"
            render={
              <Button variant="ghost" className="border-accent border py-4 md:border-0 md:py-0">
                <Info className="size-4" />
              </Button>
            }
          />
          <PopoverContent
            side="right"
            align="start"
            alignOffset={-20}
            className="bg-popover/60 backdrop-blur-2xl"
          >
            <PopoverHeader className="bg-accent rounded-md border py-2">
              <div className="flex items-center justify-center space-x-3 text-lg font-semibold">
                <Badge variant="outline">{topStats?.hltv}</Badge>
                <img src={topStats?.icon} className="size-6" />
                <span>
                  {(topStats.matchStats.find((match) => match.opponent === bottomTeam)?.wins ?? 0) +
                    " - " +
                    (topStats.matchStats.find((match) => match.opponent === bottomTeam)?.losses ??
                      0)}
                </span>
                <img src={bottomStats?.icon} className="size-6" />
                <Badge variant="outline">{bottomStats?.hltv}</Badge>
              </div>
            </PopoverHeader>
            <Accordion>
              {mapNames.map((map) => (
                <MapAccordion key={map} map={map} topStats={topStats} bottomStats={bottomStats} />
              ))}
            </Accordion>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

function MapAccordion({
  map,
  topStats,
  bottomStats,
}: {
  map: string;
  topStats: CombinedType;
  bottomStats: CombinedType;
}) {
  const topMapStats = topStats.mapStats.find((mapStat) => mapStat.map === map)!;
  const bottomMapStats = bottomStats.mapStats.find((mapStat) => mapStat.map === map)!;

  const topPick = topStats.mapStats.sort((a, b) => b.pick - a.pick).slice(0, 2);
  const topBan = topStats.mapStats.sort((a, b) => b.ban - a.ban).slice(0, 1);
  const bottomPick = bottomStats.mapStats.sort((a, b) => b.pick - a.pick).slice(0, 2);
  const bottomBan = bottomStats.mapStats.sort((a, b) => b.ban - a.ban).slice(0, 1);

  return (
    <AccordionItem key={map}>
      <AccordionTrigger className="bg-accent hover:bg-accent/80 tabular-nums hover:no-underline">
        {
          <div className="grid w-full grid-cols-3 gap-4">
            <span className="w-1/3 font-bold">{map}</span>
            <span
              className={`flex w-1/3 ${topPick.find((pick) => pick.map === map) ? "text-green-500" : topBan.find((ban) => ban.map === map) ? "text-red-500" : ""} `}
            >
              <img src={topStats.icon} className="mx-auto my-auto mr-2 size-4" />
              {(topMapStats?.pick.toFixed(1) ?? "0.0") + "%"}
            </span>
            <span
              className={`flex w-1/3 ${bottomPick.find((pick) => pick.map === map) ? "text-green-500" : bottomBan.find((ban) => ban.map === map) ? "text-red-500" : ""} `}
            >
              <img src={bottomStats.icon} className="mx-auto my-auto mr-2 size-4" />
              {(bottomMapStats.pick.toFixed(1) ?? "0.0") + "%"}
            </span>
          </div>
        }
      </AccordionTrigger>
      <AccordionContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead />
              <TableHead>{<img src={topStats.icon} className="mx-auto size-8" />}</TableHead>
              <TableHead>{<img src={bottomStats.icon} className="mx-auto size-8" />}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="tabular-nums">
            <TableRow className="text-center hover:bg-transparent">
              <TableCell className="font-semibold">Win</TableCell>
              <TableCell
                className={
                  topMapStats.winRate > bottomMapStats.winRate ? "text-green-500" : "text-red-500"
                }
              >
                {topMapStats.winRate.toFixed(1) + "%"}
              </TableCell>
              <TableCell
                className={
                  bottomMapStats.winRate > topMapStats.winRate ? "text-green-500" : "text-red-500"
                }
              >
                {bottomMapStats.winRate.toFixed(1) + "%"}
              </TableCell>
            </TableRow>
            <TableRow className="text-center hover:bg-transparent">
              <TableCell className="font-semibold">Pick</TableCell>
              <TableCell
                className={
                  topMapStats.pick > bottomMapStats.pick ? "text-green-500" : "text-red-500"
                }
              >
                {topMapStats.pick.toFixed(1) + "%"}
              </TableCell>
              <TableCell
                className={
                  bottomMapStats.pick > topMapStats.pick ? "text-green-500" : "text-red-500"
                }
              >
                {bottomMapStats.pick.toFixed(1) + "%"}
              </TableCell>
            </TableRow>
            <TableRow className="text-center hover:bg-transparent">
              <TableCell className="font-semibold">Ban</TableCell>
              <TableCell
                className={topMapStats.ban < bottomMapStats.ban ? "text-green-500" : "text-red-500"}
              >
                {topMapStats.ban.toFixed(1) + "%"}
              </TableCell>
              <TableCell
                className={bottomMapStats.ban < topMapStats.ban ? "text-green-500" : "text-red-500"}
              >
                {bottomMapStats.ban.toFixed(1) + "%"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </AccordionContent>
    </AccordionItem>
  );
}

function FinalResults({ rounds }: { rounds: Round[] }) {
  const sections = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];

  const results = stage2Teams.map((team) => {
    const wins = rounds.reduce((acc, round) => {
      const match = round.matchups.find(
        (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
      );
      if (match && match.winner === team) {
        return acc + 1;
      }
      return acc;
    }, 0);

    const losses = rounds.reduce((acc, round) => {
      const match = round.matchups.find(
        (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
      );
      if (match && match.winner && match.winner !== team) {
        return acc + 1;
      }
      return acc;
    }, 0);

    return {
      icon: teamStats.find((stat) => stat.name === team)?.icon,
      record: `${wins}-${losses}`,
      team: team,
    };
  });

  return (
    <div className="h-full w-full space-y-8">
      <div className="mb-4 text-center text-lg md:text-2xl">Final Results</div>
      {sections.map((section) => (
        <div
          key={section}
          className={`min-w-15 space-y-1 rounded-lg border p-2 ${
            section === "3-0"
              ? "border-green-700"
              : section === "3-1"
                ? "border-green-800"
                : section === "3-2"
                  ? "border-green-900"
                  : section === "2-3"
                    ? "border-red-900"
                    : section === "1-3"
                      ? "border-red-800"
                      : "border-red-700"
          }`}
        >
          <div className="text-center text-xl">{section}</div>
          {results.map(
            (result) =>
              result.record === section && (
                <Item
                  key={result.team}
                  variant="outline"
                  className={`w-full min-w-10.5 flex-nowrap select-none ${
                    section === "3-0"
                      ? "bg-green-700"
                      : section === "3-1"
                        ? "bg-green-800"
                        : section === "3-2"
                          ? "bg-green-900"
                          : section === "2-3"
                            ? "bg-red-900"
                            : section === "1-3"
                              ? "bg-red-800"
                              : "bg-red-700"
                  }`}
                >
                  <ItemMedia>
                    <img src={result.icon} className="size-4" />
                  </ItemMedia>
                  <ItemContent className="hidden truncate lg:block">
                    <ItemTitle>{result.team}</ItemTitle>
                  </ItemContent>
                </Item>
              ),
          )}
        </div>
      ))}
    </div>
  );
}
