// ==========================================
// Headless Deterministic Match Simulation Engine
// Discrete 20s tick temporal state machine
// ==========================================

import {
  Club,
  Tactic,
  TacticalSlot,
  Player,
  PitchZone,
  MatchEvent,
  ShotRecord,
  PlayerMatchStats,
  MatchSummaryStats,
  MatchTickState,
  MatchSimulationResult,
  MatchLivePlayer,
  CardBooking,
  PlayerRoleName,
  RoleDuty,
  ShotType
} from '../../types';
import { PRNG } from '../math/prng';
import { PitchGeometry } from '../math/vector';
import { ExpectedGoalsEngine } from './xg';
import { DuelEngine } from './duel';
import { FatigueModel } from './fatigue';
import { CommentaryEngine } from './commentary';

export class MatchSimulator {
  private prng: PRNG;
  private seed: string;

  constructor(seed: string = 'match-sim-default') {
    this.seed = seed;
    this.prng = new PRNG(seed);
  }

  /**
   * Simulates a full headless match between two clubs with their chosen tactics
   */
  public simulate(
    homeClub: Club,
    awayClub: Club,
    homeTactic: Tactic,
    awayTactic: Tactic,
    recordTicks: boolean = true
  ): MatchSimulationResult {
    const startTime = performance.now();

    // 1. Resolve starting 11 for both teams
    const homeLineup = this.getLineupPlayers(homeClub, homeTactic);
    const awayLineup = this.getLineupPlayers(awayClub, awayTactic);

    const homeGk = homeLineup.find(p => p.slot.position === 'GK')?.player ?? homeClub.players[0];
    const awayGk = awayLineup.find(p => p.slot.position === 'GK')?.player ?? awayClub.players[0];

    // 2. Initialize tracking data structures
    const homeConditions = new Map<string, number>();
    const awayConditions = new Map<string, number>();

    const playerStats: Record<string, PlayerMatchStats> = {};

    for (const item of homeLineup) {
      homeConditions.set(item.player.id, item.player.condition);
      playerStats[item.player.id] = this.createInitialPlayerStats(item.player, 'home', item.slot.role, item.slot.duty);
    }
    for (const item of awayLineup) {
      awayConditions.set(item.player.id, item.player.condition);
      playerStats[item.player.id] = this.createInitialPlayerStats(item.player, 'away', item.slot.role, item.slot.duty);
    }

    const events: MatchEvent[] = [];
    const shots: ShotRecord[] = [];
    const tickSnapshots: MatchTickState[] = [];
    const bookings: CardBooking[] = [];

    // Discipline tracking
    const homeCards = new Map<string, number>(); // 1 = yellow, 2 = red
    const awayCards = new Map<string, number>();
    const sentOffPlayers = new Set<string>();

    let homeScore = 0;
    let awayScore = 0;
    let homeXg = 0;
    let awayXg = 0;
    let homePossessionTicks = 0;
    let awayPossessionTicks = 0;

    // Ball state
    let ballZone: PitchZone = 'midfield';
    let possessionTeam: 'home' | 'away' = this.prng.nextBool() ? 'home' : 'away';

    // 3. Temporal Resolution: 90 minutes @ 20s per tick = 270 ticks + stoppage
    const stoppageFirstHalf = this.prng.nextInt(3, 7); // 1-2 mins
    const stoppageSecondHalf = this.prng.nextInt(6, 15); // 2-5 mins
    const totalTicks = 270 + stoppageFirstHalf + stoppageSecondHalf;

    for (let tick = 0; tick < totalTicks; tick++) {
      const minute = Math.min(90, Math.floor((tick * 20) / 60));
      const second = (tick * 20) % 60;

      // Handle Half-time reset
      if (tick === 135 + stoppageFirstHalf) {
        ballZone = 'midfield';
        possessionTeam = possessionTeam === 'home' ? 'away' : 'home';
      }

      // Track possession ticks
      if (possessionTeam === 'home') homePossessionTicks++;
      else awayPossessionTicks++;

      // Active attacking & defending teams
      const isHomeAttacking = possessionTeam === 'home';
      const attLineup = isHomeAttacking ? homeLineup : awayLineup;
      const defLineup = isHomeAttacking ? awayLineup : homeLineup;
      const attTactic = isHomeAttacking ? homeTactic : awayTactic;
      const defTactic = isHomeAttacking ? awayTactic : homeTactic;
      const attConditions = isHomeAttacking ? homeConditions : awayConditions;
      const defConditions = isHomeAttacking ? awayConditions : homeConditions;
      const opposingGk = isHomeAttacking ? awayGk : homeGk;

      // Available active players (exclude sent-off players)
      const availableAtt = attLineup.filter(p => !sentOffPlayers.has(p.player.id));
      const availableDef = defLineup.filter(p => !sentOffPlayers.has(p.player.id));

      const attacker = this.selectActivePlayerForZone(availableAtt.length > 0 ? availableAtt : attLineup, ballZone, true);
      const defender = this.selectActivePlayerForZone(availableDef.length > 0 ? availableDef : defLineup, ballZone, false);

      const attCondition = attConditions.get(attacker.id) ?? 100;
      const defCondition = defConditions.get(defender.id) ?? 100;

      // Check for Shot Opportunity in Penalty Box or Attacking Half-Space
      const isShotZone = ballZone === 'penalty_box' || (ballZone === 'attacking_halfspace' && this.prng.next() < 0.28);
      
      let tickPrimaryPlayer = attacker;
      let tickDefender: Player | undefined = defender;
      let tickCommentary = '';
      let tickPassTrajectory: MatchTickState['passTrajectory'] = undefined;

      if (isShotZone && this.shouldTriggerShot(attacker, ballZone)) {
        // --- SHOT RESOLUTION PIPELINE ---
        const shotType = this.determineShotType(attacker, ballZone);
        const defendersInRange = defLineup
          .filter(p => (p.slot.position === 'CB' || p.slot.position === 'LB' || p.slot.position === 'RB') && !sentOffPlayers.has(p.player.id))
          .map(p => p.player);

        const attMultiplier = FatigueModel.getEffectiveMultiplier(attCondition);
        const defMultiplier = FatigueModel.getEffectiveMultiplier(defCondition);

        const xgResult = ExpectedGoalsEngine.evaluateShot(
          this.prng,
          attacker,
          opposingGk,
          defendersInRange,
          shotType,
          ballZone,
          isHomeAttacking,
          attMultiplier,
          defMultiplier
        );

        // Update Shooter Stats
        const shooterStats = playerStats[attacker.id];
        shooterStats.shots++;
        shooterStats.xG += xgResult.xG;
        if (xgResult.outcome === 'goal' || xgResult.outcome === 'saved') {
          shooterStats.shotsOnTarget++;
        }

        // Record Shot
        shots.push({
          id: `shot-${tick}`,
          tick,
          minute,
          team: possessionTeam,
          shooterId: attacker.id,
          shooterName: attacker.name,
          x: xgResult.shotPoint.x,
          y: xgResult.shotPoint.y,
          distanceMeters: xgResult.distanceMeters,
          angleRadians: xgResult.angleRadians,
          xG: xgResult.xG,
          shotType,
          outcome: xgResult.outcome
        });

        if (isHomeAttacking) homeXg += xgResult.xG;
        else awayXg += xgResult.xG;

        tickPassTrajectory = {
          fromX: xgResult.shotPoint.x,
          fromY: xgResult.shotPoint.y,
          toX: isHomeAttacking ? 100 : 0,
          toY: 50,
          isShot: true
        };

        tickCommentary = CommentaryEngine.formatShotCommentary(
          attacker.name,
          opposingGk.name,
          xgResult.outcome,
          xgResult.distanceMeters,
          xgResult.xG
        );

        if (xgResult.outcome === 'goal') {
          if (isHomeAttacking) homeScore++;
          else awayScore++;
          shooterStats.goals++;

          events.push({
            id: `evt-${tick}`,
            tick,
            minute,
            second,
            type: 'goal',
            zone: ballZone,
            team: possessionTeam,
            primaryPlayerId: attacker.id,
            primaryPlayerName: attacker.name,
            commentary: tickCommentary,
            xG: xgResult.xG,
            shotX: xgResult.shotPoint.x,
            shotY: xgResult.shotPoint.y,
            shotOutcome: 'goal'
          });

          // Reset to kickoff in midfield
          ballZone = 'midfield';
          possessionTeam = possessionTeam === 'home' ? 'away' : 'home';
        } else if (xgResult.outcome === 'saved') {
          const gkStats = playerStats[opposingGk.id];
          gkStats.saves++;

          events.push({
            id: `evt-${tick}`,
            tick,
            minute,
            second,
            type: 'save',
            zone: ballZone,
            team: possessionTeam,
            primaryPlayerId: attacker.id,
            primaryPlayerName: attacker.name,
            secondaryPlayerId: opposingGk.id,
            secondaryPlayerName: opposingGk.name,
            commentary: tickCommentary,
            xG: xgResult.xG,
            shotX: xgResult.shotPoint.x,
            shotY: xgResult.shotPoint.y,
            shotOutcome: 'saved'
          });

          // Goalkeeper recovers ball in defensive third
          ballZone = 'defensive_third';
          possessionTeam = possessionTeam === 'home' ? 'away' : 'home';
        } else if (xgResult.outcome === 'blocked') {
          events.push({
            id: `evt-${tick}`,
            tick,
            minute,
            second,
            type: 'block',
            zone: ballZone,
            team: possessionTeam,
            primaryPlayerId: attacker.id,
            primaryPlayerName: attacker.name,
            commentary: tickCommentary,
            xG: xgResult.xG,
            shotX: xgResult.shotPoint.x,
            shotY: xgResult.shotPoint.y,
            shotOutcome: 'blocked'
          });

          // Ball spills loose or deflects
          ballZone = this.prng.nextBool() ? 'attacking_halfspace' : 'penalty_box';
          if (this.prng.nextBool()) {
            possessionTeam = possessionTeam === 'home' ? 'away' : 'home';
          }
        } else {
          // Off target -> Goal kick
          ballZone = 'defensive_third';
          possessionTeam = possessionTeam === 'home' ? 'away' : 'home';
        }
      } else {
        // --- BALL PROGRESSION DUEL PIPELINE ---
        const duelResult = DuelEngine.resolveZoneProgression(
          this.prng,
          ballZone,
          attacker,
          defender,
          attCondition,
          defCondition,
          attTactic,
          defTactic
        );

        tickPrimaryPlayer = duelResult.primaryPlayer;
        tickDefender = duelResult.secondaryPlayer ?? defender;
        tickCommentary = CommentaryEngine.formatEventCommentary(
          duelResult.commentaryTemplate,
          attacker.name,
          defender.name
        );

        // Update player pass/tackle/interception counters
        if (duelResult.eventType === 'pass' || duelResult.eventType === 'progressive_pass') {
          const pStats = playerStats[attacker.id];
          pStats.passesAttempted++;
          if (duelResult.success) pStats.passesCompleted++;

          const fromP = PitchGeometry.getZoneCenter(ballZone, isHomeAttacking);
          const toP = PitchGeometry.getZoneCenter(duelResult.nextZone, isHomeAttacking);
          tickPassTrajectory = {
            fromX: fromP.x,
            fromY: fromP.y,
            toX: toP.x,
            toY: toP.y,
            isShot: false
          };
        } else if (duelResult.eventType === 'tackle') {
          const dStats = playerStats[defender.id];
          dStats.tacklesAttempted++;
          dStats.tacklesWon++;
        } else if (duelResult.eventType === 'interception') {
          const dStats = playerStats[defender.id];
          dStats.interceptions++;
        } else if (duelResult.isFoul) {
          const dStats = playerStats[defender.id];
          dStats.foulsCommitted++;

          const cardsMap = isHomeAttacking ? awayCards : homeCards;
          const currentYellows = cardsMap.get(defender.id) || 0;

          // Check for Penalty Kick inside penalty box
          if (ballZone === 'penalty_box' && this.prng.next() < 0.85) {
            // Direct Penalty Kick
            const penXg = 0.79;
            const penRoll = this.prng.next();
            const penGoal = penRoll < penXg;
            const shooterStats = playerStats[attacker.id];
            shooterStats.shots++;
            shooterStats.xG += penXg;

            shots.push({
              id: `pen-${tick}`,
              tick,
              minute,
              team: possessionTeam,
              shooterId: attacker.id,
              shooterName: attacker.name,
              x: isHomeAttacking ? 88.5 : 11.5,
              y: 50,
              distanceMeters: 11,
              angleRadians: 0.65,
              xG: penXg,
              shotType: 'penalty',
              outcome: penGoal ? 'goal' : 'saved'
            });

            if (isHomeAttacking) homeXg += penXg;
            else awayXg += penXg;

            if (penGoal) {
              if (isHomeAttacking) homeScore++;
              else awayScore++;
              shooterStats.goals++;
              shooterStats.shotsOnTarget++;
              tickCommentary = `🚨 PENALTY GOAL! ${attacker.name} coolly sends ${opposingGk.name} the wrong way from the spot!`;
              events.push({
                id: `evt-${tick}-pen`,
                tick,
                minute,
                second,
                type: 'goal',
                zone: 'penalty_box',
                team: possessionTeam,
                primaryPlayerId: attacker.id,
                primaryPlayerName: attacker.name,
                commentary: tickCommentary,
                xG: penXg,
                shotX: isHomeAttacking ? 88.5 : 11.5,
                shotY: 50,
                shotOutcome: 'goal'
              });
              ballZone = 'midfield';
              possessionTeam = possessionTeam === 'home' ? 'away' : 'home';
            } else {
              const gkStats = playerStats[opposingGk.id];
              gkStats.saves++;
              tickCommentary = `🚨 PENALTY SAVED! ${opposingGk.name} produces an incredible diving save to deny ${attacker.name}'s penalty!`;
              events.push({
                id: `evt-${tick}-pensave`,
                tick,
                minute,
                second,
                type: 'save',
                zone: 'penalty_box',
                team: possessionTeam,
                primaryPlayerId: attacker.id,
                primaryPlayerName: attacker.name,
                secondaryPlayerId: opposingGk.id,
                secondaryPlayerName: opposingGk.name,
                commentary: tickCommentary,
                xG: penXg,
                shotX: isHomeAttacking ? 88.5 : 11.5,
                shotY: 50,
                shotOutcome: 'saved'
              });
              ballZone = 'defensive_third';
              possessionTeam = possessionTeam === 'home' ? 'away' : 'home';
            }
          }

          // Card resolution
          if (duelResult.card === 'red_card') {
            dStats.redCards++;
            cardsMap.set(defender.id, 2);
            sentOffPlayers.add(defender.id);
            bookings.push({
              playerId: defender.id,
              playerName: defender.name,
              team: isHomeAttacking ? 'away' : 'home',
              minute,
              type: 'red_card',
              reason: 'Reckless tackle'
            });
            tickCommentary = `🟥 STRAIGHT RED CARD! ${defender.name} is sent off for a reckless, dangerous tackle on ${attacker.name}!`;
            events.push({
              id: `evt-${tick}-red`,
              tick,
              minute,
              second,
              type: 'red_card',
              zone: ballZone,
              team: isHomeAttacking ? 'away' : 'home',
              primaryPlayerId: defender.id,
              primaryPlayerName: defender.name,
              secondaryPlayerId: attacker.id,
              secondaryPlayerName: attacker.name,
              commentary: tickCommentary
            });
          } else if (duelResult.card === 'yellow_card') {
            if (currentYellows >= 1) {
              // Second yellow -> Red card
              dStats.yellowCards++;
              dStats.redCards++;
              cardsMap.set(defender.id, 2);
              sentOffPlayers.add(defender.id);
              bookings.push({
                playerId: defender.id,
                playerName: defender.name,
                team: isHomeAttacking ? 'away' : 'home',
                minute,
                type: 'second_yellow',
                reason: 'Second yellow card offence'
              });
              tickCommentary = `🟥 SECOND YELLOW & RED! ${defender.name} commits another cynical foul on ${attacker.name} and is sent off!`;
              events.push({
                id: `evt-${tick}-2ndyellow`,
                tick,
                minute,
                second,
                type: 'red_card',
                zone: ballZone,
                team: isHomeAttacking ? 'away' : 'home',
                primaryPlayerId: defender.id,
                primaryPlayerName: defender.name,
                secondaryPlayerId: attacker.id,
                secondaryPlayerName: attacker.name,
                commentary: tickCommentary
              });
            } else {
              dStats.yellowCards++;
              cardsMap.set(defender.id, 1);
              bookings.push({
                playerId: defender.id,
                playerName: defender.name,
                team: isHomeAttacking ? 'away' : 'home',
                minute,
                type: 'yellow_card',
                reason: 'Tactical foul'
              });
              tickCommentary = `🟨 Yellow Card: ${defender.name} booked for a tactical foul on ${attacker.name}.`;
              events.push({
                id: `evt-${tick}-yellow`,
                tick,
                minute,
                second,
                type: 'yellow_card',
                zone: ballZone,
                team: isHomeAttacking ? 'away' : 'home',
                primaryPlayerId: defender.id,
                primaryPlayerName: defender.name,
                secondaryPlayerId: attacker.id,
                secondaryPlayerName: attacker.name,
                commentary: tickCommentary
              });
            }
          }
        } else if (duelResult.isOffside) {
          tickCommentary = `🚩 OFFSIDE! ${attacker.name} caught beyond the last defender as ${defender.name} steps up the defensive trap.`;
          events.push({
            id: `evt-${tick}-offside`,
            tick,
            minute,
            second,
            type: 'offside',
            zone: ballZone,
            team: possessionTeam,
            primaryPlayerId: attacker.id,
            primaryPlayerName: attacker.name,
            secondaryPlayerId: defender.id,
            secondaryPlayerName: defender.name,
            commentary: tickCommentary
          });
        }

        // Only log key highlight events to keep memory footprint lean
        const isHighlight = duelResult.eventType === 'progressive_pass' ||
          duelResult.eventType === 'dribble' ||
          duelResult.eventType === 'tackle' ||
          duelResult.eventType === 'interception' ||
          duelResult.isFoul ||
          duelResult.isCorner ||
          duelResult.isOffside;

        if (isHighlight && !events.some(e => e.id.startsWith(`evt-${tick}`)) && this.prng.next() < 0.55) {
          events.push({
            id: `evt-${tick}`,
            tick,
            minute,
            second,
            type: duelResult.eventType,
            zone: ballZone,
            team: possessionTeam,
            primaryPlayerId: duelResult.primaryPlayer.id,
            primaryPlayerName: duelResult.primaryPlayer.name,
            secondaryPlayerId: duelResult.secondaryPlayer?.id,
            secondaryPlayerName: duelResult.secondaryPlayer?.name,
            commentary: tickCommentary
          });
        }

        // Update ball zone & possession state
        ballZone = duelResult.nextZone;
        if (!duelResult.possessionRetained) {
          possessionTeam = possessionTeam === 'home' ? 'away' : 'home';
        }
      }

      // --- FATIGUE & CONDITION DEGRADATION ---
      for (const item of homeLineup) {
        const cond = homeConditions.get(item.player.id) ?? 100;
        const drop = FatigueModel.calculateTickConditionDrop(
          item.player,
          homeTactic.inPossession.tempo,
          homeTactic.outOfPossession.pressingIntensity,
          item.player.id === tickPrimaryPlayer.id
        );
        homeConditions.set(item.player.id, Math.max(30, cond - drop));
      }

      for (const item of awayLineup) {
        const cond = awayConditions.get(item.player.id) ?? 100;
        const drop = FatigueModel.calculateTickConditionDrop(
          item.player,
          awayTactic.inPossession.tempo,
          awayTactic.outOfPossession.pressingIntensity,
          item.player.id === tickPrimaryPlayer.id
        );
        awayConditions.set(item.player.id, Math.max(30, cond - drop));
      }

      // Record tick snapshot for visual timeline playback
      if (recordTicks && tick % 2 === 0) {
        const ballPos = PitchGeometry.getZoneCenter(ballZone, possessionTeam === 'home');
        const homeCondAvg = Array.from(homeConditions.values()).reduce((a, b) => a + b, 0) / 11;
        const awayCondAvg = Array.from(awayConditions.values()).reduce((a, b) => a + b, 0) / 11;

        // Compute 2D spatial positions for all 22 players on the pitch!
        const livePlayers = this.computeLivePlayers(
          homeLineup,
          awayLineup,
          possessionTeam,
          ballPos,
          tickPrimaryPlayer,
          tickDefender,
          homeCards,
          awayCards,
          sentOffPlayers,
          homeConditions,
          awayConditions
        );

        tickSnapshots.push({
          tick,
          minute,
          second,
          ballZone,
          possessionTeam,
          ballCoordinates: ballPos,
          activePlayerId: tickPrimaryPlayer.id,
          activePlayerName: tickPrimaryPlayer.name,
          activeDefenderId: tickDefender?.id,
          activeDefenderName: tickDefender?.name,
          homeConditionAvg: Math.round(homeCondAvg * 10) / 10,
          awayConditionAvg: Math.round(awayCondAvg * 10) / 10,
          players: livePlayers,
          passTrajectory: tickPassTrajectory,
          homeScore,
          awayScore
        });
      }
    }

    // 4. Finalize Player Ratings & Summary Stats
    this.calculateFinalPlayerRatings(playerStats, homeConditions, awayConditions, homeScore, awayScore);

    const summaryStats = this.aggregateSummaryStats(
      homeScore,
      awayScore,
      homeXg,
      awayXg,
      homePossessionTicks,
      awayPossessionTicks,
      playerStats,
      events
    );

    const endTime = performance.now();
    const durationMs = Math.round((endTime - startTime) * 100) / 100;

    // Deterministic verification hash
    const verificationHash = this.computeVerificationHash(summaryStats, shots);

    return {
      matchId: `match-${this.seed}`,
      seed: this.seed,
      homeClubId: homeClub.id,
      homeClubName: homeClub.name,
      awayClubId: awayClub.id,
      awayClubName: awayClub.name,
      homeTactic,
      awayTactic,
      stats: summaryStats,
      events,
      shots,
      playerStats,
      ticks: tickSnapshots,
      bookings,
      durationMs,
      verificationHash
    };
  }

  /**
   * Calculates realistic 2D coordinates for all 22 players on the pitch
   */
  private computeLivePlayers(
    homeLineup: { player: Player; slot: TacticalSlot }[],
    awayLineup: { player: Player; slot: TacticalSlot }[],
    possessionTeam: 'home' | 'away',
    ballPos: { x: number; y: number },
    activeAttacker: Player,
    activeDefender: Player | undefined,
    homeCards: Map<string, number>,
    awayCards: Map<string, number>,
    sentOffPlayers: Set<string>,
    homeConditions: Map<string, number>,
    awayConditions: Map<string, number>
  ): MatchLivePlayer[] {
    const list: MatchLivePlayer[] = [];
    const isHomePossession = possessionTeam === 'home';

    // 1. Home Team (Attacks Left to Right: x: 0 -> 100)
    homeLineup.forEach((item, idx) => {
      const p = item.player;
      const slot = item.slot;
      const isSentOff = sentOffPlayers.has(p.id);
      const yellowCount = homeCards.get(p.id) || 0;
      const cond = homeConditions.get(p.id) || 100;

      // Base coordinates from slot: gridX (0-4) is width across pitch, gridY (0-4) is depth
      let baseY = 16 + slot.gridX * 17;
      let baseX = slot.position === 'GK' ? 6 : (18 + slot.gridY * 15);

      if (isHomePossession) {
        baseX = Math.min(88, baseX + 9);
        baseY = 50 + (baseY - 50) * 1.12;
      } else {
        baseX = Math.max(8, baseX - 6);
        baseY = 50 + (baseY - 50) * 0.88;
      }

      baseY = Math.max(8, Math.min(92, baseY + (ballPos.y - 50) * 0.22));

      const isCarrier = isHomePossession && p.id === activeAttacker.id;
      const isChallenger = !isHomePossession && activeDefender !== undefined && p.id === activeDefender.id;

      let finalX = baseX;
      let finalY = baseY;

      if (isCarrier) {
        finalX = ballPos.x;
        finalY = ballPos.y;
      } else if (isChallenger) {
        finalX = Math.min(94, Math.max(6, ballPos.x + 3.2));
        finalY = Math.min(94, Math.max(6, ballPos.y + 1.2));
      }

      if (isSentOff) {
        finalX = 3;
        finalY = 96;
      }

      list.push({
        id: p.id,
        name: p.name,
        number: idx + 1,
        position: slot.position,
        role: slot.role,
        duty: slot.duty,
        team: 'home',
        x: Math.round(finalX * 10) / 10,
        y: Math.round(finalY * 10) / 10,
        hasYellowCard: yellowCount === 1,
        isSentOff,
        condition: Math.round(cond),
        isCarrier,
        isChallenger
      });
    });

    // 2. Away Team (Attacks Right to Left: x: 100 -> 0)
    const isAwayPossession = possessionTeam === 'away';

    awayLineup.forEach((item, idx) => {
      const p = item.player;
      const slot = item.slot;
      const isSentOff = sentOffPlayers.has(p.id);
      const yellowCount = awayCards.get(p.id) || 0;
      const cond = awayConditions.get(p.id) || 100;

      let baseY = 84 - slot.gridX * 17;
      let baseX = slot.position === 'GK' ? 94 : (82 - slot.gridY * 15);

      if (isAwayPossession) {
        baseX = Math.max(12, baseX - 9);
        baseY = 50 + (baseY - 50) * 1.12;
      } else {
        baseX = Math.min(92, baseX + 6);
        baseY = 50 + (baseY - 50) * 0.88;
      }

      baseY = Math.max(8, Math.min(92, baseY + (ballPos.y - 50) * 0.22));

      const isCarrier = isAwayPossession && p.id === activeAttacker.id;
      const isChallenger = !isAwayPossession && activeDefender !== undefined && p.id === activeDefender.id;

      let finalX = baseX;
      let finalY = baseY;

      if (isCarrier) {
        finalX = ballPos.x;
        finalY = ballPos.y;
      } else if (isChallenger) {
        finalX = Math.min(94, Math.max(6, ballPos.x - 3.2));
        finalY = Math.min(94, Math.max(6, ballPos.y - 1.2));
      }

      if (isSentOff) {
        finalX = 97;
        finalY = 96;
      }

      list.push({
        id: p.id,
        name: p.name,
        number: idx + 1,
        position: slot.position,
        role: slot.role,
        duty: slot.duty,
        team: 'away',
        x: Math.round(finalX * 10) / 10,
        y: Math.round(finalY * 10) / 10,
        hasYellowCard: yellowCount === 1,
        isSentOff,
        condition: Math.round(cond),
        isCarrier,
        isChallenger
      });
    });

    return list;
  }

  private getLineupPlayers(club: Club, tactic: Tactic): { player: Player; slot: (typeof tactic.slots)[0] }[] {
    const list: { player: Player; slot: (typeof tactic.slots)[0] }[] = [];
    for (const slot of tactic.slots) {
      const match = club.players.find(p => p.id === slot.assignedPlayerId);
      if (match) {
        list.push({ player: match, slot });
      } else {
        // Fallback to position match
        const fallback = club.players.find(p => p.position === slot.position && !list.some(l => l.player.id === p.id)) ?? club.players[0];
        list.push({ player: fallback, slot });
      }
    }
    return list;
  }

  private selectActivePlayerForZone(
    lineup: { player: Player; slot: TacticalSlot }[],
    zone: PitchZone,
    isAttacking: boolean
  ): Player {
    // Filter players who naturally operate in or adjacent to this zone
    let candidates: Player[] = [];
    if (zone === 'defensive_third') {
      candidates = lineup
        .filter(p => p.slot.position === 'CB' || p.slot.position === 'LB' || p.slot.position === 'RB' || p.slot.position === 'GK')
        .map(p => p.player);
    } else if (zone === 'midfield') {
      candidates = lineup
        .filter(p => p.slot.position === 'DM' || p.slot.position === 'CM' || p.slot.position === 'AM')
        .map(p => p.player);
    } else if (zone === 'wide_flanks') {
      candidates = lineup
        .filter(p => p.slot.position === 'LM' || p.slot.position === 'RM' || p.slot.position === 'LW' || p.slot.position === 'RW' || p.slot.position === 'LB' || p.slot.position === 'RB')
        .map(p => p.player);
    } else if (zone === 'attacking_halfspace' || zone === 'penalty_box') {
      candidates = lineup
        .filter(p => p.slot.position === 'ST' || p.slot.position === 'AM' || p.slot.position === 'LW' || p.slot.position === 'RW')
        .map(p => p.player);
    }

    if (candidates.length === 0) {
      candidates = lineup.map(p => p.player);
    }

    // Role duty weight: Attackers prioritize attack duty, defenders prioritize defend duty
    const weights = candidates.map(p => {
      const slot = lineup.find(l => l.player.id === p.id)?.slot;
      let w = 1.0;
      if (isAttacking && slot?.duty === 'Attack') w = 2.0;
      if (!isAttacking && slot?.duty === 'Defend') w = 2.0;
      return w;
    });

    const totalW = weights.reduce((a, b) => a + b, 0);
    let roll = this.prng.next() * totalW;

    for (let i = 0; i < candidates.length; i++) {
      if (roll < weights[i]) return candidates[i];
      roll -= weights[i];
    }

    return candidates[0];
  }

  private shouldTriggerShot(attacker: Player, zone: PitchZone): boolean {
    if (zone === 'penalty_box') return true;
    // Attacking halfspace: triggered based on finishing, decisions, long shots
    const { finishing } = attacker.attributes.technical;
    const { decisions } = attacker.attributes.mental;
    const prob = (finishing * 0.6 + decisions * 0.4) / 40; // 0.15 to 0.45
    return this.prng.next() < prob;
  }

  private determineShotType(attacker: Player, zone: PitchZone): ShotType {
    if (zone === 'penalty_box') {
      const roll = this.prng.next();
      if (roll < 0.22 && attacker.attributes.technical.heading > 12) return 'header';
      if (roll < 0.38) return 'counter_1v1';
      return 'open_play';
    }
    return 'long_shot';
  }

  private createInitialPlayerStats(
    player: Player,
    team: 'home' | 'away',
    role: PlayerRoleName,
    duty: RoleDuty
  ): PlayerMatchStats {
    return {
      playerId: player.id,
      name: player.name,
      position: player.position,
      role,
      duty,
      team,
      rating: 6.0,
      conditionRemaining: player.condition,
      goals: 0,
      assists: 0,
      shots: 0,
      shotsOnTarget: 0,
      xG: 0,
      passesAttempted: 0,
      passesCompleted: 0,
      tacklesAttempted: 0,
      tacklesWon: 0,
      interceptions: 0,
      foulsCommitted: 0,
      yellowCards: 0,
      redCards: 0,
      saves: 0
    };
  }

  private calculateFinalPlayerRatings(
    stats: Record<string, PlayerMatchStats>,
    homeConditions: Map<string, number>,
    awayConditions: Map<string, number>,
    homeScore: number,
    awayScore: number
  ): void {
    for (const [id, s] of Object.entries(stats)) {
      let rating = 6.0;

      // Goals & Assists
      rating += s.goals * 1.0;
      rating += s.assists * 0.5;

      // Passing impact
      if (s.passesAttempted > 0) {
        const passPct = s.passesCompleted / s.passesAttempted;
        rating += (passPct - 0.75) * 0.8;
      }

      // Defensive actions
      rating += s.tacklesWon * 0.15;
      rating += s.interceptions * 0.12;
      rating += s.saves * 0.25;

      // Discipline penalties
      rating -= s.foulsCommitted * 0.1;
      rating -= s.yellowCards * 0.4;
      rating -= s.redCards * 1.5;

      // Team result bonus/penalty
      const won = (s.team === 'home' && homeScore > awayScore) || (s.team === 'away' && awayScore > homeScore);
      const lost = (s.team === 'home' && homeScore < awayScore) || (s.team === 'away' && awayScore < homeScore);
      if (won) rating += 0.3;
      if (lost) rating -= 0.3;

      // Update remaining condition
      const cond = (s.team === 'home' ? homeConditions.get(id) : awayConditions.get(id)) ?? 100;
      s.conditionRemaining = Math.round(cond);

      // Clamp rating to 3.0 - 10.0 scale
      s.rating = Math.max(3.0, Math.min(10.0, Math.round(rating * 10) / 10));
    }
  }

  private aggregateSummaryStats(
    homeScore: number,
    awayScore: number,
    homeXg: number,
    awayXg: number,
    homePossessionTicks: number,
    awayPossessionTicks: number,
    playerStats: Record<string, PlayerMatchStats>,
    events: MatchEvent[]
  ): MatchSummaryStats {
    const totalPossession = homePossessionTicks + awayPossessionTicks || 1;
    const homePossessionPct = Math.round((homePossessionTicks / totalPossession) * 100);
    const awayPossessionPct = 100 - homePossessionPct;

    let homeShots = 0, awayShots = 0;
    let homeShotsOnTarget = 0, awayShotsOnTarget = 0;
    let homePassesAttempted = 0, awayPassesAttempted = 0;
    let homePassesCompleted = 0, awayPassesCompleted = 0;
    let homeTackles = 0, awayTackles = 0;
    let homeInterceptions = 0, awayInterceptions = 0;
    let homeFouls = 0, awayFouls = 0;
    let homeYellowCards = 0, awayYellowCards = 0;
    let homeRedCards = 0, awayRedCards = 0;

    for (const s of Object.values(playerStats)) {
      if (s.team === 'home') {
        homeShots += s.shots;
        homeShotsOnTarget += s.shotsOnTarget;
        homePassesAttempted += s.passesAttempted;
        homePassesCompleted += s.passesCompleted;
        homeTackles += s.tacklesWon;
        homeInterceptions += s.interceptions;
        homeFouls += s.foulsCommitted;
        homeYellowCards += s.yellowCards;
        homeRedCards += s.redCards;
      } else {
        awayShots += s.shots;
        awayShotsOnTarget += s.shotsOnTarget;
        awayPassesAttempted += s.passesAttempted;
        awayPassesCompleted += s.passesCompleted;
        awayTackles += s.tacklesWon;
        awayInterceptions += s.interceptions;
        awayFouls += s.foulsCommitted;
        awayYellowCards += s.yellowCards;
        awayRedCards += s.redCards;
      }
    }

    const homePassAccuracyPct = homePassesAttempted > 0 ? Math.round((homePassesCompleted / homePassesAttempted) * 100) : 80;
    const awayPassAccuracyPct = awayPassesAttempted > 0 ? Math.round((awayPassesCompleted / awayPassesAttempted) * 100) : 80;

    const homeCorners = events.filter(e => e.type === 'corner' && e.team === 'home').length;
    const awayCorners = events.filter(e => e.type === 'corner' && e.team === 'away').length;

    return {
      homeScore,
      awayScore,
      homeXg: Math.round(homeXg * 100) / 100,
      awayXg: Math.round(awayXg * 100) / 100,
      homePossessionPct,
      awayPossessionPct,
      homeShots,
      awayShots,
      homeShotsOnTarget,
      awayShotsOnTarget,
      homePassesAttempted,
      homePassesCompleted,
      homePassAccuracyPct,
      awayPassesAttempted,
      awayPassesCompleted,
      awayPassAccuracyPct,
      homeTackles,
      awayTackles,
      homeInterceptions,
      awayInterceptions,
      homeFouls,
      awayFouls,
      homeCorners,
      awayCorners,
      homeYellowCards,
      awayYellowCards,
      homeRedCards,
      awayRedCards
    };
  }

  private computeVerificationHash(stats: MatchSummaryStats, shots: ShotRecord[]): string {
    const raw = `${stats.homeScore}:${stats.awayScore}-${stats.homeXg}:${stats.awayXg}-${shots.length}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}
