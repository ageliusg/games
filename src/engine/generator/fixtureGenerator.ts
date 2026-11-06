// ==========================================
// Fixtures & Standings Generator
// Deterministic 38-Gameweek Round Robin Schedule
// ==========================================

import { Club, Fixture, Matchday, ClubStanding } from '../../types';

export class FixtureGenerator {
  /**
   * Generates a 38-matchday round-robin schedule for a 20-club league
   * Uses the standard polygon/circle round-robin algorithm
   */
  public static generateSchedule(clubs: Club[], leagueSeed: string = 'fixtures-2026'): Matchday[] {
    const clubCount = clubs.length;
    if (clubCount < 2) return [];

    // Working list of club IDs
    const clubIds = clubs.map(c => c.id);
    const clubMap = new Map(clubs.map(c => [c.id, c]));

    const rounds = (clubCount - 1) * 2; // 38 matchdays for 20 clubs
    const matchesPerRound = clubCount / 2; // 10 matches per matchday

    const matchdays: Matchday[] = [];

    // Standard round-robin polygon algorithm (1 fixed team, rest rotate)
    const teams = [...clubIds];

    for (let round = 0; round < rounds; round++) {
      const matchdayNum = round + 1;
      const isSecondHalf = round >= clubCount - 1;
      const fixtures: Fixture[] = [];

      for (let i = 0; i < matchesPerRound; i++) {
        let homeIndex = i;
        let awayIndex = clubCount - 1 - i;

        let homeId = teams[homeIndex];
        let awayId = teams[awayIndex];

        // Invert home/away in the second half of the season or alternate rounds for balance
        const shouldSwap = (round % 2 === 1 && i === 0) || isSecondHalf;
        if (shouldSwap) {
          const temp = homeId;
          homeId = awayId;
          awayId = temp;
        }

        const homeClub = clubMap.get(homeId)!;
        const awayClub = clubMap.get(awayId)!;

        fixtures.push({
          id: `fix-md${matchdayNum}-${i + 1}`,
          matchday: matchdayNum,
          homeClubId: homeId,
          awayClubId: awayId,
          homeClubName: homeClub.name,
          awayClubName: awayClub.name,
          homeClubCode: homeClub.code,
          awayClubCode: awayClub.code,
          homePrimaryColor: homeClub.primaryColor,
          awayPrimaryColor: awayClub.primaryColor,
          played: false,
          matchSeed: `${leagueSeed}-md${matchdayNum}-m${i + 1}`
        });
      }

      matchdays.push({
        matchdayNumber: matchdayNum,
        fixtures
      });

      // Rotate teams array keeping first team fixed
      const fixed = teams[0];
      const rest = teams.slice(1);
      const last = rest.pop()!;
      teams.length = 0;
      teams.push(fixed, last, ...rest);
    }

    return matchdays;
  }

  /**
   * Initializes clean standings for all clubs
   */
  public static initializeStandings(clubs: Club[]): ClubStanding[] {
    return clubs.map(c => ({
      clubId: c.id,
      clubName: c.name,
      clubCode: c.code,
      primaryColor: c.primaryColor,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: []
    })).sort((a, b) => a.clubName.localeCompare(b.clubName));
  }

  /**
   * Recomputes the entire standings table from all played fixtures
   */
  public static calculateStandings(clubs: Club[], matchdays: Matchday[]): ClubStanding[] {
    const standingsMap = new Map<string, ClubStanding>();

    for (const c of clubs) {
      standingsMap.set(c.id, {
        clubId: c.id,
        clubName: c.name,
        clubCode: c.code,
        primaryColor: c.primaryColor,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        form: []
      });
    }

    for (const md of matchdays) {
      for (const fix of md.fixtures) {
        if (!fix.played || fix.homeScore === undefined || fix.awayScore === undefined) continue;

        const home = standingsMap.get(fix.homeClubId);
        const away = standingsMap.get(fix.awayClubId);
        if (!home || !away) continue;

        home.played++;
        away.played++;
        home.goalsFor += fix.homeScore;
        home.goalsAgainst += fix.awayScore;
        away.goalsFor += fix.awayScore;
        away.goalsAgainst += fix.homeScore;

        if (fix.homeScore > fix.awayScore) {
          home.won++;
          home.points += 3;
          home.form.push('W');
          away.lost++;
          away.form.push('L');
        } else if (fix.homeScore < fix.awayScore) {
          away.won++;
          away.points += 3;
          away.form.push('W');
          home.lost++;
          home.form.push('L');
        } else {
          home.drawn++;
          home.points += 1;
          home.form.push('D');
          away.drawn++;
          away.points += 1;
          away.form.push('D');
        }

        home.goalDifference = home.goalsFor - home.goalsAgainst;
        away.goalDifference = away.goalsFor - away.goalsAgainst;
      }
    }

    // Keep only last 5 form matches
    const list = Array.from(standingsMap.values());
    for (const entry of list) {
      if (entry.form.length > 5) {
        entry.form = entry.form.slice(entry.form.length - 5);
      }
    }

    // Sort by Points DESC -> GD DESC -> GF DESC -> Name ASC
    list.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.clubName.localeCompare(b.clubName);
    });

    return list;
  }
}
