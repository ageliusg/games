// ==========================================
// Procedural Name & Lore Generator
// Football universe naming database
// ==========================================

import { PRNG } from '../math/prng';

export class NameGenerator {
  private static FIRST_NAMES = [
    'Alexander', 'Marcus', 'Gabriel', 'Lucas', 'Julian', 'Matteo', 'Thiago', 'Liam',
    'Oliver', 'Mateo', 'Noah', 'Leo', 'Hugo', 'Arthur', 'Felix', 'Elias', 'Alvaro',
    'Diego', 'Rafael', 'Kylian', 'Adrian', 'Victor', 'Leon', 'Sandro', 'Milan',
    'Dominik', 'Stefan', 'Florian', 'Bruno', 'Ruben', 'Joao', 'Bernardo', 'Eduardo',
    'Dario', 'Nico', 'Enzo', 'Lorenzo', 'Santi', 'Federico', 'Declan', 'Mason',
    'Jude', 'Bukayo', 'Phil', 'Trent', 'Reece', 'Harry', 'Jack', 'Callum', 'Harvey'
  ];

  private static LAST_NAMES = [
    'Silva', 'Santos', 'Fernandes', 'Rodriguez', 'Garcia', 'Martinez', 'Hernandez',
    'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Vargas',
    'Castillo', 'Romero', 'Alvarez', 'Muller', 'Schmidt', 'Schneider', 'Fischer',
    'Weber', 'Meyer', 'Wagner', 'Becker', 'Hoffmann', 'Schulz', 'Koch', 'Bauer',
    'Dupont', 'Laurent', 'Moreau', 'Fournier', 'Girard', 'Bonnet', 'Rousseau',
    'Davies', 'Sterling', 'Walker', 'Shaw', 'Rice', 'Bellingham', 'Saka', 'Foden',
    'Alexander-Arnold', 'James', 'Kane', 'Grealish', 'Mount', 'Maguire', 'Stones'
  ];

  private static NATIONALITIES = [
    'England', 'Spain', 'Germany', 'France', 'Brazil', 'Argentina', 'Portugal',
    'Italy', 'Netherlands', 'Belgium', 'Croatia', 'Denmark', 'Norway', 'Sweden',
    'Uruguay', 'Colombia', 'Japan', 'South Korea', 'Senegal', 'Nigeria'
  ];

  private static CITIES_TIER1 = [
    'London', 'Manchester', 'Liverpool', 'Madrid', 'Barcelona', 'Munich', 'Milan',
    'Turin', 'Paris', 'Amsterdam', 'Lisbon', 'Porto', 'Rome', 'Naples', 'Valencia',
    'Seville', 'Dortmund', 'Bremen', 'Lyon', 'Marseille'
  ];

  private static CITIES_TIER2 = [
    'Birmingham', 'Leeds', 'Sheffield', 'Bristol', 'Nottingham', 'Leicester',
    'Southampton', 'Norwich', 'Stoke', 'Sunderland', 'Middlesbrough', 'Blackburn',
    'Preston', 'Coventry', 'Swansea', 'Cardiff', 'Hull', 'Plymouth', 'Ipswich', 'Derby'
  ];

  private static CLUB_SUFFIXES = [
    'FC', 'United', 'City', 'Athletic', 'Rovers', 'Wanderers', 'Town', 'Albion',
    'Sporting', 'Real'
  ];

  private static STADIUM_PREFIXES = [
    'St. Jude', 'Kingsway', 'Victoria', 'Riverside', 'Oakwood', 'Highbury', 'Meadow',
    'Crown', 'Apex', 'Valle', 'Olympic', 'Metropolitan', 'Borough', 'Northgate'
  ];

  private static STADIUM_SUFFIXES = [
    'Park', 'Ground', 'Stadium', 'Arena', 'Lane', 'Road', 'Meadow', 'Dome'
  ];

  private static CLUB_COLORS: [string, string][] = [
    ['#dc2626', '#ffffff'], // Red / White
    ['#2563eb', '#ffffff'], // Royal Blue / White
    ['#16a34a', '#ffffff'], // Green / White
    ['#9333ea', '#facc15'], // Purple / Gold
    ['#0284c7', '#38bdf8'], // Sky Blue / Cyan
    ['#0f172a', '#e2e8f0'], // Navy / Silver
    ['#ea580c', '#000000'], // Orange / Black
    ['#ca8a04', '#1e293b'], // Gold / Navy
    ['#b91c1c', '#000000'], // Dark Red / Black
    ['#059669', '#fef08a'], // Emerald / Yellow
    ['#4338ca', '#f43f5e'], // Indigo / Rose
    ['#0d9488', '#f8fafc'], // Teal / White
    ['#6b21a8', '#ffffff'], // Violet / White
    ['#1e1b4b', '#38bdf8'], // Deep Navy / Sky
    ['#7c2d12', '#fed7aa'], // Claret / Amber
    ['#15803d', '#ffffff'], // Forest Green / White
    ['#475569', '#f1f5f9'], // Slate / Ice
    ['#be123c', '#ffffff'], // Crimson / White
    ['#854d0e', '#fef9c3'], // Amber / Cream
    ['#1e293b', '#e11d48'], // Charcoal / Red
  ];

  public static generatePlayerName(prng: PRNG): { name: string; nationality: string } {
    const first = prng.pick(this.FIRST_NAMES);
    const last = prng.pick(this.LAST_NAMES);
    const nationality = prng.pick(this.NATIONALITIES);
    return { name: `${first} ${last}`, nationality };
  }

  public static generateClubInfo(
    prng: PRNG,
    tier: 1 | 2,
    index: number
  ): {
    name: string;
    shortName: string;
    code: string;
    stadiumName: string;
    primaryColor: string;
    secondaryColor: string;
  } {
    const cityList = tier === 1 ? this.CITIES_TIER1 : this.CITIES_TIER2;
    const city = cityList[index % cityList.length];
    const suffix = prng.pick(this.CLUB_SUFFIXES);

    const name = `${city} ${suffix}`;
    const shortName = city;
    const code = (city.substring(0, 3)).toUpperCase();

    const stadiumPrefix = prng.pick(this.STADIUM_PREFIXES);
    const stadiumSuffix = prng.pick(this.STADIUM_SUFFIXES);
    const stadiumName = `${stadiumPrefix} ${stadiumSuffix}`;

    const colors = this.CLUB_COLORS[index % this.CLUB_COLORS.length];

    return {
      name,
      shortName,
      code,
      stadiumName,
      primaryColor: colors[0],
      secondaryColor: colors[1]
    };
  }
}
