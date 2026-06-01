import { Info } from "lucide-react";
import { useEffect, useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "#ui/accordion";
import { Button } from "#ui/button";
import { Item, ItemContent, ItemMedia, ItemTitle } from "#ui/item";
import { Popover, PopoverContent, PopoverTrigger } from "#ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#ui/table";

import teamStats from "@/scrape/combinedStats.json";

import type { CombinedType } from "@/types";

const mapNames = ["Ancient", "Anubis", "Dust2", "Inferno", "Mirage", "Nuke", "Overpass"];

export default function Bracket() {
  return (
    <div className="grid grid-cols-5 gap-8">
      <Round1 />
      <Round2 />
      <Round3 />
      <Round4 />
      <Round5 />
    </div>
  );
}

function Round1() {
  return (
    <div className="space-y-8">
      <div className="mb-4 text-center text-2xl">Round 1</div>
      <div className="space-y-4 rounded-lg border p-2">
        <div className="text-center text-xl">0-0</div>
        <Matchup topTeam={"GamerLegion"} bottomTeam={"NRG"} />
        <Matchup topTeam={"B8"} bottomTeam={"TYLOO"} />
        <Matchup topTeam={"HEROIC"} bottomTeam={"Sharks"} />
        <Matchup topTeam={"BetBoom"} bottomTeam={"Gaimin Gladiators"} />
        <Matchup topTeam={"BIG"} bottomTeam={"Liquid"} />
        <Matchup topTeam={"M80"} bottomTeam={"Lynn Vision"} />
        <Matchup topTeam={"MIBR"} bottomTeam={"THUNDER dOWNUNDER"} />
        <Matchup topTeam={"SINNERS"} bottomTeam={"FlyQuest"} />
      </div>
    </div>
  );
}

function Round2() {
  return (
    <div className="space-y-8">
      <div className="mb-4 text-center text-2xl">Round 2</div>
      <div className="space-y-4 rounded-lg border p-2">
        <div className="text-center text-xl">1-0</div>
        <Matchup topTeam={"GamerLegion"} bottomTeam={"NRG"} />
        <Matchup topTeam={"B8"} bottomTeam={"TYLOO"} />
        <Matchup topTeam={"HEROIC"} bottomTeam={"Sharks"} />
        <Matchup topTeam={"BetBoom"} bottomTeam={"Gaimin Gladiators"} />
      </div>
      <div className="space-y-4 rounded-lg border p-2">
        <div className="text-center text-xl">0-1</div>
        <Matchup topTeam={"BIG"} bottomTeam={"Liquid"} />
        <Matchup topTeam={"M80"} bottomTeam={"Lynn Vision"} />
        <Matchup topTeam={"MIBR"} bottomTeam={"THUNDER dOWNUNDER"} />
        <Matchup topTeam={"SINNERS"} bottomTeam={"FlyQuest"} />
      </div>
    </div>
  );
}

function Round3() {
  return (
    <div className="space-y-8">
      <div className="mb-4 text-center text-2xl">Round 3</div>
      <div className="space-y-4 rounded-lg border p-2">
        <div className="text-center text-xl">2-0</div>
        <Matchup topTeam={"GamerLegion"} bottomTeam={"NRG"} />
        <Matchup topTeam={"B8"} bottomTeam={"TYLOO"} />
      </div>
      <div className="space-y-4 rounded-lg border p-2">
        <div className="text-center text-xl">1-1</div>
        <Matchup topTeam={"BIG"} bottomTeam={"Liquid"} />
        <Matchup topTeam={"M80"} bottomTeam={"Lynn Vision"} />
        <Matchup topTeam={"MIBR"} bottomTeam={"THUNDER dOWNUNDER"} />
        <Matchup topTeam={"SINNERS"} bottomTeam={"FlyQuest"} />
      </div>
      <div className="space-y-4 rounded-lg border p-2">
        <div className="text-center text-xl">0-2</div>
        <Matchup topTeam={"BIG"} bottomTeam={"Liquid"} />
        <Matchup topTeam={"M80"} bottomTeam={"Lynn Vision"} />
      </div>
    </div>
  );
}
function Round4() {
  return (
    <div className="space-y-8">
      <div className="mb-4 text-center text-2xl">Round 4</div>
      <div className="space-y-4 rounded-lg border p-2">
        <div className="text-center text-xl">2-1</div>
        <Matchup topTeam={"GamerLegion"} bottomTeam={"NRG"} />
        <Matchup topTeam={"B8"} bottomTeam={"TYLOO"} />
        <Matchup topTeam={"SINNERS"} bottomTeam={"FlyQuest"} />
      </div>
      <div className="space-y-4 rounded-lg border p-2">
        <div className="text-center text-xl">1-2</div>
        <Matchup topTeam={"BIG"} bottomTeam={"Liquid"} />
        <Matchup topTeam={"M80"} bottomTeam={"Lynn Vision"} />
        <Matchup topTeam={"MIBR"} bottomTeam={"THUNDER dOWNUNDER"} />
      </div>
    </div>
  );
}

function Round5() {
  return (
    <div className="space-y-8">
      <div className="mb-4 text-center text-2xl">Round 5</div>
      <div className="space-y-4 rounded-lg border p-2">
        <div className="text-center text-xl">2-2</div>
        <Matchup topTeam={"GamerLegion"} bottomTeam={"NRG"} />
        <Matchup topTeam={"B8"} bottomTeam={"TYLOO"} />
        <Matchup topTeam={"B8"} bottomTeam={"TYLOO"} />
      </div>
    </div>
  );
}

function Matchup({ topTeam, bottomTeam }: { topTeam: string; bottomTeam: string }) {
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
