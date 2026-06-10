import { Item, ItemContent, ItemMedia, ItemTitle } from "#ui/item";

import teamStats from "@/scrape/combinedStats.json";
import { type RoundType } from "@/types";

export default function FinalResults({ teams, rounds }: { teams: string[]; rounds: RoundType[] }) {
  const sections = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];

  const results = teams.map((team) => {
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

    const buchholzOpp = rounds.reduce<string[]>((acc, stageRound) => {
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

  results.sort((a, b) => {
    const resDiff = b.buchholzSelf - a.buchholzSelf;

    const seedDiff =
      teams.findIndex((team) => team === a.team) - teams.findIndex((team) => team === b.team);

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
