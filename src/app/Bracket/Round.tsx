import { Info } from "lucide-react";
import { useEffect, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "#ui/accordion";
import { Badge } from "#ui/badge";
import { Button } from "#ui/button";
import { Item, ItemContent, ItemMedia } from "#ui/item";
import { Popover, PopoverContent, PopoverHeader, PopoverTrigger } from "#ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#ui/table";

import teamStats from "@/scrape/combinedStats.json";
import { type CombinedType, type MatchupType } from "@/types";

const mapNames = ["Ancient", "Anubis", "Dust2", "Inferno", "Mirage", "Nuke", "Overpass"];

export default function Round({
  id,
  matchups,
  setResults,
}: {
  id: string;
  matchups: MatchupType[];
  setResults: (arg0: string, arg1: string, arg2: string | null) => void;
}) {
  let sections: ("0-0" | "0-1" | "0-2" | "1-0" | "1-1" | "1-2" | "2-0" | "2-1" | "2-2" | "")[];
  switch (id) {
    case "1":
      sections = ["0-0"];
      break;
    case "2":
      sections = ["1-0", "0-1"];
      break;
    case "3":
      sections = ["2-0", "1-1", "0-2"];
      break;
    case "4":
      sections = ["2-1", "1-2"];
      break;
    case "5":
      sections = ["2-2"];
      break;
    default:
      sections = [""];
      break;
  }
  return (
    <div className="h-full w-full min-w-15">
      <div className="mb-4 text-center text-lg md:text-2xl">
        {id.length > 1 ? id : `Round ${id}`}
      </div>
      <div className="h-full place-content-center space-y-8">
        {sections.map(
          (section) =>
            matchups.length > 0 && (
              <div key={section} className="space-y-4 rounded-lg border p-2">
                {<div className="text-center text-xl">{section}</div>}
                {matchups.map(
                  (matchup) =>
                    matchup.section === section && (
                      <Matchup
                        key={matchup.topTeam + "-" + matchup.bottomTeam}
                        topTeam={matchup.topTeam}
                        bottomTeam={matchup.bottomTeam}
                        winner={matchup.winner}
                        id={id}
                        setResults={setResults}
                        topStats={teamStats.find((team) => team.name === matchup.topTeam)}
                        bottomStats={teamStats.find((team) => team.name === matchup.bottomTeam)}
                      />
                    ),
                )}
              </div>
            ),
        )}
      </div>
    </div>
  );
}

function Matchup({
  topTeam,
  bottomTeam,
  winner,
  id,
  setResults,
  topStats,
  bottomStats,
}: {
  topTeam: string;
  bottomTeam: string;
  winner: string | null;
  id: string;
  setResults: (arg0: string, arg1: string, arg2: string | null) => void;
  topStats: CombinedType | undefined;
  bottomStats: CombinedType | undefined;
}) {
  const [selectTopTeam, setSelectTopTeam] = useState<boolean>(winner === topTeam);
  const [selectBottomTeam, setSelectBottomTeam] = useState<boolean>(winner === bottomTeam);

  useEffect(() => {
    setSelectTopTeam(winner === topTeam);
    setSelectBottomTeam(winner === bottomTeam);
  }, [winner, topTeam, bottomTeam]);

  for (const mapName of mapNames) {
    if (topStats && !topStats.mapStats.find((stat) => stat.map === mapName)) {
      topStats.mapStats.push({
        ban: 100,
        losses: 0,
        map: mapName,
        pick: 0,
        winRate: 0,
        wins: 0,
      });
    }
    if (bottomStats && !bottomStats.mapStats.find((stat) => stat.map === mapName)) {
      bottomStats.mapStats.push({
        ban: 100,
        losses: 0,
        map: mapName,
        pick: 0,
        winRate: 0,
        wins: 0,
      });
    }
  }

  return (
    <div className="md:flex">
      <div className="w-full min-w-10.5 space-y-1">
        <Item
          className={`w-full cursor-pointer flex-nowrap select-none ${selectTopTeam ? "text-foreground/90 bg-green-700/80 font-bold hover:bg-green-700/70" : "bg-secondary-foreground/40 hover:bg-secondary-foreground/35 text-primary-foreground font-semibold"}`}
          onClick={() => {
            setResults(id, topTeam, selectTopTeam ? null : topTeam);
            setSelectTopTeam(!selectTopTeam);
            if (selectBottomTeam) setSelectBottomTeam(false);
          }}
        >
          <ItemMedia>
            <img src={topStats?.icon} className="size-4" />
          </ItemMedia>
          <ItemContent className="hidden truncate lg:block">{topTeam}</ItemContent>
        </Item>
        <Item
          className={`w-full min-w-10.5 cursor-pointer flex-nowrap select-none ${selectBottomTeam ? "text-foreground/90 bg-green-700/80 font-bold hover:bg-green-700/70" : "bg-secondary-foreground/40 hover:bg-secondary-foreground/35 text-primary-foreground font-semibold"}`}
          onClick={() => {
            setResults(id, topTeam, selectBottomTeam ? null : bottomTeam);
            setSelectBottomTeam(!selectBottomTeam);
            if (selectTopTeam) setSelectTopTeam(false);
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
            className="my-1 h-9.5 w-full md:my-auto md:ml-2 md:h-6 md:w-6"
            render={
              <Button variant="ghost" className="border-accent border py-4 md:border-0 md:py-0">
                <Info className="size-4" />
              </Button>
            }
          />
          <PopoverContent
            side="right"
            sideOffset={20}
            alignOffset={-31}
            className="bg-popover/60 backdrop-blur-2xl"
          >
            <PopoverHeader className="bg-muted-foreground/25 rounded-md border py-2">
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
      <AccordionTrigger className="bg-muted-foreground/20 hover:bg-muted-foreground/15 tabular-nums hover:no-underline">
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
      <AccordionContent className="mx-4 mt-4">
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
