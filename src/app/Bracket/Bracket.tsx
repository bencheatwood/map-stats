import { Info } from "lucide-react";
import { useEffect, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "#ui/accordion";
import { Button } from "#ui/button";
import { Item, ItemContent, ItemMedia, ItemTitle } from "#ui/item";
import { Popover, PopoverContent, PopoverTrigger } from "#ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#ui/table";

import teamStats from "@/scrape/combinedStats.json";

import type { CombinedType, Matchup, Round } from "@/types";

const mapNames = ["Ancient", "Anubis", "Dust2", "Inferno", "Mirage", "Nuke", "Overpass"];
const stage1Teams = [
  "GamerLegion",
  "NRG",
  "B8",
  "TYLOO",
  "HEROIC",
  "Sharks",
  "BetBoom",
  "Gaimin Gladiators",
  "BIG",
  "Liquid",
  "M80",
  "Lynn Vision",
  "MIBR",
  "THUNDER dOWNUNDER",
  "SINNERS",
  "FlyQuest",
].sort(
  (a, b) =>
    teamStats.find((team) => team.name === a)!.valve -
    teamStats.find((team) => team.name === b)!.valve,
);

export default function Bracket() {
  const [rounds, setRounds] = useState<Round[]>([
    {
      id: 1,
      matchups: stage1Teams.reduce((acc, team, i) => {
        if (i < 8)
          acc.push({ section: "0-0", topTeam: team, bottomTeam: stage1Teams[i + 8], winner: null });
        return acc;
      }, [] as Matchup[]),
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

        const prevResults = stage1Teams.map((team) => {
          const wins = updateRounds.reduce((acc, round) => {
            const matchup = round.matchups.find(
              (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
            );
            if (round.id <= id && matchup && matchup.winner === team) {
              return acc + 1;
            }
            return acc;
          }, 0);

          const losses = updateRounds.reduce((acc, round) => {
            const matchup = round.matchups.find(
              (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
            );
            if (round.id <= id && matchup && matchup.winner && matchup.winner !== team) {
              return acc + 1;
            }
            return acc;
          }, 0);

          const buchholzOpp = updateRounds.reduce((acc, round) => {
            const matchup = round.matchups.find(
              (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
            );
            if (round.id <= id && matchup && matchup.winner) {
              acc.push(matchup!.topTeam === team ? matchup!.bottomTeam : matchup!.topTeam);
            }
            return acc;
          }, [] as string[]);

          return {
            team: team,
            record: `${wins}-${losses}`,
            buchholzSelf: wins - losses,
            buchholzOpp: buchholzOpp,
          };
        });

        const updatedMatchups: Matchup[][] = [];
        for (const section of sections) {
          const sectionTeams = prevResults
            .filter((result) => result.record === section)
            .sort((a, b) => {
              const valveDiff =
                teamStats.find((team) => team.name === a.team)!.valve -
                teamStats.find((team) => team.name === b.team)!.valve;

              const buchDiff =
                prevResults.reduce((acc, team) => {
                  if (b.buchholzOpp.includes(team.team)) acc += team.buchholzSelf;
                  return acc;
                }, 0) -
                prevResults.reduce((acc, team) => {
                  if (a.buchholzOpp.includes(team.team)) acc += team.buchholzSelf;
                  return acc;
                }, 0);

              return buchDiff || valveDiff;
            });

          const newMatchups = sectionTeams.reduce((acc, team, i) => {
            if (i < Math.floor(sectionTeams.length / 2)) {
              acc.push({
                section: section,
                topTeam: team.team,
                bottomTeam: sectionTeams[sectionTeams.length - (i + 1)].team,
                winner: null,
              });
            }
            return acc;
          }, [] as Matchup[]);

          const tempMatchups: Matchup[] = [];
          let i = 0;
          while (i < newMatchups.length) {
            console.log(i);
            if (
              sectionTeams
                .find((team) => team.team === newMatchups[i].topTeam)!
                .buchholzOpp.includes(newMatchups[i].bottomTeam) &&
              i < newMatchups.length - 2
            ) {
              console.log("repeat", newMatchups[i].topTeam, newMatchups[i].bottomTeam);
              tempMatchups.push({ ...newMatchups[i], bottomTeam: newMatchups[i + 1].bottomTeam });
              tempMatchups.push({ ...newMatchups[i + 1], bottomTeam: newMatchups[i].bottomTeam });
              i += 2;
            } else {
              tempMatchups.push(newMatchups[i]);
              i++;
            }
          }
          console.log(tempMatchups);
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
    <div className="grid grid-cols-5 gap-8">
      {[1, 2, 3, 4, 5].map((id) => (
        <Round
          key={id}
          id={id}
          matchups={rounds.find((round) => round.id === id)?.matchups ?? []}
          setResults={setResults}
        />
      ))}
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
  let shown = false;
  switch (id) {
    case 1:
      sections = ["0-0"];
      shown = true;
      break;
    case 2:
      sections = ["1-0", "0-1"];
      shown = matchups.length === 8;
      break;
    case 3:
      sections = ["2-0", "1-1", "0-2"];
      shown = matchups.length === 8;
      break;
    case 4:
      sections = ["2-1", "1-2"];
      shown = matchups.length === 6;
      break;
    default:
      sections = ["2-2"];
      shown = matchups.length === 3;
      break;
  }
  return (
    shown && (
      <div className="space-y-8">
        <div className="mb-4 text-center text-2xl">{`Round ${id}`}</div>
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
          map: mapName,
          wins: 0,
          losses: 0,
          winRate: 0,
          pick: 0,
          ban: 100,
        });
      }
      if (!tempBottomStats.mapStats.find((stat) => stat.map === mapName)) {
        tempBottomStats.mapStats.push({
          map: mapName,
          wins: 0,
          losses: 0,
          winRate: 0,
          pick: 0,
          ban: 100,
        });
      }
    }
    setTopStats(tempTopStats);
    setBottomStats(tempBottomStats);
  }, [topTeam, bottomTeam]);

  return (
    <div className="flex space-x-1">
      <div className="w-fit space-y-1">
        <Item
          variant="outline"
          className={`w-50 cursor-pointer select-none ${selectTopTeam ? "bg-green-700/80 hover:bg-green-700/60 " : "bg-accent hover:bg-accent/80 "}`}
          onClick={() => {
            setSelectTopTeam(!selectTopTeam);
            if (selectBottomTeam) setSelectBottomTeam(false);
            setResults(id, topTeam, !selectTopTeam ? topTeam : null);
          }}
        >
          <ItemMedia>
            <img src={topStats?.icon} className="size-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{topTeam}</ItemTitle>
          </ItemContent>
        </Item>
        <Item
          variant="outline"
          className={`cursor-pointer select-none ${selectBottomTeam ? "bg-green-700/80 hover:bg-green-700/60 " : "bg-accent hover:bg-accent/80 "}`}
          onClick={() => {
            setSelectBottomTeam(!selectBottomTeam);
            if (selectTopTeam) setSelectTopTeam(false);
            setResults(id, topTeam, !selectBottomTeam ? bottomTeam : null);
          }}
        >
          <ItemMedia>
            <img src={bottomStats?.icon} className="size-4" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>{bottomTeam}</ItemTitle>
          </ItemContent>
        </Item>
      </div>
      {topStats && bottomStats && (
        <Popover>
          <PopoverTrigger
            className="my-auto"
            render={
              <Button variant="ghost">
                <Info className="size-4" />
              </Button>
            }
          ></PopoverTrigger>
          <PopoverContent side="right" className="bg-popover/40 backdrop-blur-2xl">
            <Accordion className="">
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
