export interface Team {
  id: number;
  name: string;
}

export type TeamMapStats = {
  name: string;
  stats: MapStats[];
};

export type TeamMatchStats = {
  name: string;
  stats: MatchStats[];
};

export type MapStats = {
  map: string;
  stats: Record<string, string>;
};

export type CombinedMapStats = {
  map: string;
  wins: number;
  losses: number;
  winRate: number;
  pick: number;
  ban: number;
};

export interface Rank {
  name: string;
  rank: number;
}

export interface HLTVRank extends Rank {
  icon: string;
}

export type CombinedRank = {
  name: string;
  icon: string;
  hltv: number;
  valve: number;
};

export type MatchStats = {
  opponent: string;
  wins: number;
  losses: number;
  matches: string[];
};

export interface CombinedType extends Team {
  valve: number;
  hltv: number;
  icon: string;
  mapStats: CombinedMapStats[];
  matchStats: MatchStats[];
}

export type RoundType = {
  id: number;
  matchups: MatchupType[];
};

export type MatchupType = {
  section: "0-0" | "1-0" | "0-1" | "2-0" | "1-1" | "0-2" | "2-1" | "1-2" | "2-2";
  topTeam: string;
  bottomTeam: string;
  winner: string | null;
};

export type PickType = {
  stage: number | string;
  rounds: RoundType[];
};
