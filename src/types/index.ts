// ==========================================
// Deep Football Management Simulation - Types
// ==========================================

export type Position = 
  | 'GK' 
  | 'CB' 
  | 'LB' 
  | 'RB' 
  | 'DM' 
  | 'CM' 
  | 'LM' 
  | 'RM' 
  | 'AM' 
  | 'LW' 
  | 'RW' 
  | 'ST';

export interface TechnicalAttributes {
  finishing: number;   // 1-20
  passing: number;     // 1-20
  tackling: number;    // 1-20
  technique: number;   // 1-20
  firstTouch: number;  // 1-20
  crossing: number;    // 1-20
  dribbling: number;   // 1-20
  heading: number;     // 1-20
}

export interface MentalAttributes {
  decisions: number;      // 1-20
  vision: number;         // 1-20
  composure: number;      // 1-20
  anticipation: number;   // 1-20
  positioning: number;    // 1-20
  workRate: number;       // 1-20
  determination: number;  // 1-20
  bravery: number;        // 1-20
  teamwork: number;       // 1-20
}

export interface PhysicalAttributes {
  pace: number;            // 1-20
  acceleration: number;    // 1-20
  stamina: number;         // 1-20
  strength: number;        // 1-20
  agility: number;         // 1-20
  balance: number;         // 1-20
  naturalFitness: number;  // 1-20
}

export interface GoalkeepingAttributes {
  reflexes: number;     // 1-20
  handling: number;     // 1-20
  oneOnOnes: number;    // 1-20
  aerialReach: number;  // 1-20
  kicking: number;      // 1-20
}

export interface PlayerAttributes {
  technical: TechnicalAttributes;
  mental: MentalAttributes;
  physical: PhysicalAttributes;
  goalkeeping: GoalkeepingAttributes;
}

export interface HiddenVariables {
  currentAbility: number;    // 1-200
  potentialAbility: number;  // 1-200
  consistency: number;       // 1-20
  dirtiness: number;         // 1-20
  injuryProneness: number;   // 1-20
  ambition: number;          // 1-20
  professionalism: number;   // 1-20
  loyalty: number;           // 1-20
  pressure: number;          // 1-20
  temperament: number;       // 1-20
}

export type PersonalityType =
  | 'Model Professional'
  | 'Professional'
  | 'Resolute'
  | 'Determined'
  | 'Ambitious'
  | 'Driven'
  | 'Mercenary'
  | 'Spirited'
  | 'Iron Willed'
  | 'Fairly Professional'
  | 'Leader'
  | 'Balanced';

export interface Player {
  id: string;
  name: string;
  age: number;
  nationality: string;
  position: Position;
  secondaryPositions: Position[];
  preferredFoot: 'Left' | 'Right' | 'Both';
  attributes: PlayerAttributes;
  hidden: HiddenVariables;
  personality: PersonalityType;
  wageWeekly: number; // in £ or $
  marketValue: number;
  contractYears: number;
  condition: number; // 0 - 100
  morale: number; // 0 - 100
}

// ---------------- CLUB & LEAGUE ----------------

export interface ClubFinances {
  wageBudgetWeekly: number;
  currentWageBillWeekly: number;
  transferBudget: number;
  balance: number;
  stadiumCapacity: number;
  ticketPriceAverage: number;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  code: string;
  tier: 1 | 2;
  reputation: number; // 1 - 10000
  stadiumName: string;
  finances: ClubFinances;
  primaryColor: string;
  secondaryColor: string;
  players: Player[];
  activeTacticId: string;
}

export interface League {
  id: string;
  name: string;
  tier: 1 | 2;
  season: number;
  clubs: Club[];
}

// ---------------- TACTICS ----------------

export type PlayerRoleName =
  | 'Goalkeeper'
  | 'Sweeper Keeper'
  | 'Central Defender'
  | 'Ball-Playing Defender'
  | 'Full-Back'
  | 'Wing-Back'
  | 'Inverted Wing-Back'
  | 'Defensive Midfielder'
  | 'Deep-Lying Playmaker'
  | 'Box-to-Box Midfielder'
  | 'Central Midfielder'
  | 'Mezzala'
  | 'Advanced Playmaker'
  | 'Winger'
  | 'Inverted Winger'
  | 'Inside Forward'
  | 'Target Forward'
  | 'Poacher'
  | 'Advanced Forward'
  | 'Complete Forward';

export type RoleDuty = 'Defend' | 'Support' | 'Attack';

export type TacticalWidth = 'Narrow' | 'Standard' | 'Wide' | 'Extremely Wide';
export type TacticalDirectness = 'Short' | 'Balanced' | 'Direct' | 'Route One';
export type TacticalTempo = 'Low' | 'Standard' | 'High' | 'Maximum';

export type TransitionLoss = 'Counter-Press' | 'Regroup';
export type TransitionGain = 'Counter' | 'Hold Shape';

export type DefensiveLineHeight = 'Very Low' | 'Low' | 'Mid-Block' | 'High Line' | 'Much Higher Line';
export type PressingIntensity = 'Never' | 'Cautious' | 'Regular' | 'Frequent' | 'Extreme';

export interface InPossessionInstructions {
  width: TacticalWidth;
  directness: TacticalDirectness;
  tempo: TacticalTempo;
}

export interface InTransitionInstructions {
  onLossOfPossession: TransitionLoss;
  onWonPossession: TransitionGain;
}

export interface OutOfPossessionInstructions {
  defensiveLine: DefensiveLineHeight;
  pressingIntensity: PressingIntensity;
  offsideTrap: boolean;
}

export interface TacticalSlot {
  slotId: string; // e.g. "slot-0" to "slot-10"
  gridX: number;  // 0 to 4 (0=Left, 4=Right)
  gridY: number;  // 0 to 4 (0=GK/CB, 4=Striker)
  position: Position;
  role: PlayerRoleName;
  duty: RoleDuty;
  assignedPlayerId: string;
}

export interface Tactic {
  id: string;
  name: string;
  formationName: string;
  slots: TacticalSlot[]; // 11 slots
  inPossession: InPossessionInstructions;
  inTransition: InTransitionInstructions;
  outOfPossession: OutOfPossessionInstructions;
}

// ---------------- MATCH SIMULATION ----------------

export type PitchZone = 
  | 'defensive_third'
  | 'defensive_halfspace'
  | 'midfield'
  | 'attacking_halfspace'
  | 'wide_flanks'
  | 'penalty_box';

export type MatchEventType = 
  | 'possession_change'
  | 'pass'
  | 'progressive_pass'
  | 'interception'
  | 'tackle'
  | 'dribble'
  | 'turnover'
  | 'shot'
  | 'goal'
  | 'save'
  | 'block'
  | 'foul'
  | 'yellow_card'
  | 'red_card'
  | 'corner'
  | 'offside'
  | 'injury';

export type ShotOutcome = 'goal' | 'saved' | 'blocked' | 'off_target';

export type ShotType = 'open_play' | 'header' | 'counter_1v1' | 'long_shot' | 'penalty';

export interface MatchEvent {
  id: string;
  tick: number;
  minute: number;
  second: number;
  type: MatchEventType;
  zone: PitchZone;
  team: 'home' | 'away';
  primaryPlayerId: string;
  primaryPlayerName: string;
  secondaryPlayerId?: string;
  secondaryPlayerName?: string;
  commentary: string;
  xG?: number;
  shotX?: number; // 0 to 100% of pitch
  shotY?: number; // 0 to 100% of pitch
  shotOutcome?: ShotOutcome;
}

export interface ShotRecord {
  id: string;
  tick: number;
  minute: number;
  team: 'home' | 'away';
  shooterId: string;
  shooterName: string;
  x: number; // 0 to 100
  y: number; // 0 to 100
  distanceMeters: number;
  angleRadians: number;
  xG: number;
  shotType: ShotType;
  outcome: ShotOutcome;
}

export interface PlayerMatchStats {
  playerId: string;
  name: string;
  position: Position;
  role: PlayerRoleName;
  duty: RoleDuty;
  team: 'home' | 'away';
  rating: number; // 1.0 to 10.0
  conditionRemaining: number; // 0 to 100
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget: number;
  xG: number;
  passesAttempted: number;
  passesCompleted: number;
  tacklesAttempted: number;
  tacklesWon: number;
  interceptions: number;
  foulsCommitted: number;
  yellowCards: number;
  redCards: number;
  saves: number;
}

export interface MatchSummaryStats {
  homeScore: number;
  awayScore: number;
  homeXg: number;
  awayXg: number;
  homePossessionPct: number;
  awayPossessionPct: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePassesAttempted: number;
  homePassesCompleted: number;
  homePassAccuracyPct: number;
  awayPassesAttempted: number;
  awayPassesCompleted: number;
  awayPassAccuracyPct: number;
  homeTackles: number;
  awayTackles: number;
  homeInterceptions: number;
  awayInterceptions: number;
  homeFouls: number;
  awayFouls: number;
  homeCorners: number;
  awayCorners: number;
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
}

export interface MatchLivePlayer {
  id: string;
  name: string;
  number: number;
  position: Position;
  role: PlayerRoleName;
  duty: RoleDuty;
  team: 'home' | 'away';
  x: number; // 0 to 100 on pitch
  y: number; // 0 to 100 on pitch
  hasYellowCard: boolean;
  isSentOff: boolean;
  condition: number; // 0-100
  isCarrier: boolean;
  isChallenger: boolean;
}

export interface MatchTickState {
  tick: number;
  minute: number;
  second: number;
  ballZone: PitchZone;
  possessionTeam: 'home' | 'away';
  ballCoordinates: { x: number; y: number }; // 0-100 pitch
  activePlayerId: string;
  activePlayerName: string;
  activeDefenderId?: string;
  activeDefenderName?: string;
  homeConditionAvg: number;
  awayConditionAvg: number;
  players: MatchLivePlayer[]; // All 22 players on the pitch
  passTrajectory?: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    isShot?: boolean;
  };
  homeScore: number;
  awayScore: number;
}

export interface CardBooking {
  playerId: string;
  playerName: string;
  team: 'home' | 'away';
  minute: number;
  type: 'yellow_card' | 'red_card' | 'second_yellow';
  reason: string;
}

export interface MatchSimulationResult {
  matchId: string;
  seed: string;
  homeClubId: string;
  homeClubName: string;
  awayClubId: string;
  awayClubName: string;
  homeTactic: Tactic;
  awayTactic: Tactic;
  stats: MatchSummaryStats;
  events: MatchEvent[];
  shots: ShotRecord[];
  playerStats: Record<string, PlayerMatchStats>;
  ticks: MatchTickState[];
  bookings: CardBooking[];
  durationMs: number;
  verificationHash: string;
}

// ---------------- FIXTURES & STANDINGS ----------------

export interface Fixture {
  id: string;
  matchday: number; // 1 to 38
  homeClubId: string;
  awayClubId: string;
  homeClubName: string;
  awayClubName: string;
  homeClubCode: string;
  awayClubCode: string;
  homePrimaryColor: string;
  awayPrimaryColor: string;
  played: boolean;
  homeScore?: number;
  awayScore?: number;
  homeXg?: number;
  awayXg?: number;
  matchSeed: string;
  result?: MatchSimulationResult;
}

export interface Matchday {
  matchdayNumber: number;
  fixtures: Fixture[];
}

export interface ClubStanding {
  clubId: string;
  clubName: string;
  clubCode: string;
  primaryColor: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

