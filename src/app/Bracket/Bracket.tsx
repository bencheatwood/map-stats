import { useEffect, useState } from "react";

import { Checkbox } from "#ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "#ui/field";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#ui/tabs";

import defaultPicks from "./defaultPicks.json";
import Playoffs from "./Playoffs";
import Stage from "./Stage";
import teamStats from "@/scrape/combinedStats.json";

import type { PickType, RoundType } from "@/types";

const stage1Teams = [
  "B8",
  "BetBoom",
  "GamerLegion",
  "M80",
  "MIBR",
  "TYLOO",
  "BIG",
  "FlyQuest",
  "NRG",
  "Liquid",
  "Lynn Vision",
  "HEROIC",
  "Sharks",
  "THUNDER dOWNUNDER",
  "Gaimin Gladiators",
  "SINNERS",
].sort(
  (a, b) =>
    teamStats.find((team) => team.name === a)!.valve -
    teamStats.find((team) => team.name === b)!.valve,
);

const initialStage2Teams = [
  "Spirit",
  "Legacy",
  "Astralis",
  "FUT",
  "G2",
  "paiN",
  "9z",
  "Monte",
].sort(
  (a, b) =>
    teamStats.find((team) => team.name === a)!.valve -
    teamStats.find((team) => team.name === b)!.valve,
);

const initialStage3Teams = [
  "Vitality",
  "Natus Vincere",
  "Falcons",
  "FURIA",
  "Aurora",
  "MOUZ",
  "The MongolZ",
  "PARIVISION",
].sort(
  (a, b) =>
    teamStats.find((team) => team.name === a)!.valve -
    teamStats.find((team) => team.name === b)!.valve,
);

const savedConfig = localStorage.getItem("savedConfig")
  ? (JSON.parse(localStorage.getItem("savedConfig")!) as PickType[])
  : null;

export default function Bracket() {
  const [stage2Teams, setStage2Teams] = useState<string[]>([]);
  const [stage3Teams, setStage3Teams] = useState<string[]>([]);
  const [playoffTeams, setPlayoffTeams] = useState<string[]>([]);
  const [pickState, setPickState] = useState<PickType[]>(
    savedConfig ? savedConfig : (defaultPicks as PickType[]),
  );
  const [saveBrowser, setSaveBrowser] = useState<boolean>(
    typeof localStorage.getItem("savedConfig") === "string",
  );
  const [stage, setStage] = useState<string>("stage1");
  const [loading, setLoading] = useState<boolean>(true);

  // This is a shitty solution but whatever for now
  useEffect(() => {
    setTimeout(() => {
      setStage("stage2");
      setTimeout(() => setStage("stage3"), 10);
      setTimeout(() => setLoading(false), 10);
    }, 10);
  }, []);

  function setPicks({
    currentStage,
    stageRounds,
    stageTeams,
  }: {
    currentStage: number;
    stageRounds: RoundType[];
    stageTeams: string[];
  }) {
    const results = stageTeams.map((team) => {
      const wins = stageRounds.reduce((acc, round) => {
        const match = round.matchups.find(
          (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
        );
        if (match && match.winner === team) {
          return acc + 1;
        }
        return acc;
      }, 0);

      const losses = stageRounds.reduce((acc, round) => {
        const match = round.matchups.find(
          (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
        );
        if (match && match.winner && match.winner !== team) {
          return acc + 1;
        }
        return acc;
      }, 0);

      const buchholzOpp = stageRounds.reduce<string[]>((acc, stageRound) => {
        const match = stageRound.matchups.find(
          (matchup) => matchup.topTeam === team || matchup.bottomTeam === team,
        );
        if (match && match.winner) {
          acc.push(match.topTeam === team ? match.bottomTeam : match.topTeam);
        }
        return acc;
      }, []);

      return {
        buchholzOpp: buchholzOpp,
        buchholzSelf: wins - losses,
        icon: teamStats.find((stat) => stat.name === team)?.icon,
        record: `${wins}-${losses}`,
        team: team,
      };
    });

    const advTeams = results
      .filter((result) => result.buchholzSelf > 0)
      .sort((a, b) => {
        const resDiff = b.buchholzSelf - a.buchholzSelf;

        const seedDiff =
          stage1Teams.findIndex((team) => team === a.team) -
          stage1Teams.findIndex((team) => team === b.team);

        const buchDiff =
          results.reduce((acc, team) => {
            if (b.buchholzOpp.includes(team.team)) acc += team.buchholzSelf;
            return acc;
          }, 0) -
          results.reduce((acc, team) => {
            if (a.buchholzOpp.includes(team.team)) acc += team.buchholzSelf;
            return acc;
          }, 0);

        return resDiff || buchDiff || seedDiff;
      })
      .map((result) => result.team);

    if (currentStage === 1) setStage2Teams(initialStage2Teams.concat(advTeams));
    else if (currentStage === 2) setStage3Teams(initialStage3Teams.concat(advTeams));
    else if (currentStage === 3) setPlayoffTeams(advTeams);

    const newPicks =
      pickState.length > 0
        ? pickState.map((pick) => {
            return pick.stage === currentStage ? { ...pick, rounds: stageRounds } : pick;
          })
        : [
            { rounds: stageRounds, stage: 1 },
            { rounds: [], stage: 2 },
            { rounds: [], stage: 3 },
            { rounds: [], stage: 4 },
          ];
    setPickState(newPicks);
    if (saveBrowser) localStorage.setItem("savedConfig", JSON.stringify(newPicks));
  }

  return (
    <Tabs value={stage} onValueChange={setStage} hidden={loading}>
      <TabsList className="mx-auto mb-4 rounded-none border-b-2 bg-transparent pb-1">
        <TabsTrigger value="stage1" className="text-md select-none">
          Stage 1
        </TabsTrigger>
        <TabsTrigger value="stage2" className="text-md select-none">
          Stage 2
        </TabsTrigger>
        <TabsTrigger value="stage3" className="text-md select-none">
          Stage 3
        </TabsTrigger>
        <TabsTrigger value="playoffs" className="text-md select-none">
          Playoffs
        </TabsTrigger>
        <FieldGroup className="mr-2 ml-10 w-37">
          <Field orientation="horizontal">
            <Checkbox
              className="cursor-pointer select-none"
              checked={saveBrowser}
              onCheckedChange={(checking) => {
                if (checking) {
                  localStorage.setItem("savedConfig", JSON.stringify(pickState));
                } else localStorage.removeItem("savedConfig");
                setSaveBrowser(checking);
              }}
            />
            <FieldLabel>Save picks to browser</FieldLabel>
          </Field>
        </FieldGroup>
      </TabsList>
      <TabsContent value="stage1">
        <Stage
          teams={stage1Teams}
          setPicks={setPicks}
          currentStage={1}
          pickStateRounds={pickState.find((pick) => pick.stage === 1)?.rounds ?? []}
        />
      </TabsContent>
      <TabsContent value="stage2">
        <Stage
          teams={stage2Teams}
          setPicks={setPicks}
          currentStage={2}
          pickStateRounds={pickState.find((pick) => pick.stage === 2)?.rounds ?? []}
        />
      </TabsContent>
      <TabsContent value="stage3">
        <Stage
          teams={stage3Teams}
          setPicks={setPicks}
          currentStage={3}
          pickStateRounds={pickState.find((pick) => pick.stage === 3)?.rounds ?? []}
        />
      </TabsContent>
      <TabsContent value="playoffs">
        <Playoffs teams={playoffTeams} />
      </TabsContent>
    </Tabs>
  );
}
