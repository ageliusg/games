// lifelines/game.js - Unified Zero-Dependency LifeLines Simulation Engine
// Combined Database, Audio Synthesizer, and Simulation Engine (No ES Modules / No CORS issues)

// --- SECTION 1: WORLD DATABASE ---
const COUNTRIES = [
  { name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'], currency: '$', taxRate: 0.22 },
  { name: 'United Kingdom', cities: ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Bristol'], currency: '£', taxRate: 0.25 },
  { name: 'Japan', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Sapporo'], currency: '¥', taxRate: 0.20 },
  { name: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'], currency: 'C$', taxRate: 0.24 },
  { name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'], currency: 'A$', taxRate: 0.23 },
  { name: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne'], currency: '€', taxRate: 0.30 },
  { name: 'France', cities: ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nice'], currency: '€', taxRate: 0.28 },
  { name: 'Brazil', cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'], currency: 'R$', taxRate: 0.18 },
  { name: 'South Korea', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu'], currency: '₩', taxRate: 0.19 },
  { name: 'Italy', cities: ['Rome', 'Milan', 'Florence', 'Naples', 'Venice'], currency: '€', taxRate: 0.26 }
];

const FIRST_NAMES_MALE = [
  'Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Lucas', 'Benjamin', 'Theodore',
  'Mateo', 'Levi', 'Sebastian', 'Daniel', 'Jack', 'Alexander', 'Owen', 'Asher', 'Samuel', 'Ethan',
  'Kenji', 'Hiroshi', 'Ren', 'Leo', 'Arthur', 'Hugo', 'Gabriel', 'Matteo', 'Luca', 'Felix'
];

const FIRST_NAMES_FEMALE = [
  'Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Evelyn', 'Luna',
  'Harper', 'Camila', 'Sofia', 'Aria', 'Chloe', 'Ella', 'Penelope', 'Layla', 'Nora', 'Hazel',
  'Sakura', 'Yuki', 'Aoi', 'Elena', 'Clara', 'Alice', 'Maya', 'Stella', 'Zoe', 'Freya'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Tanaka', 'Sato', 'Suzuki', 'Takahashi', 'Watanabe', 'Müller', 'Schmidt', 'Schneider', 'Dubois', 'Laurent'
];

const PARENT_OCCUPATIONS = [
  'Elementary Teacher', 'Architect', 'Software Engineer', 'Dentist', 'Police Officer',
  'Mechanic', 'Accountant', 'Electrician', 'Chef', 'Journalist',
  'Real Estate Agent', 'Veterinarian', 'Graphic Designer', 'Pharmacist', 'Store Manager'
];

const DEGREES = [
  { id: 'cs', name: 'Computer Science', tuition: 24000, smartsReq: 50, duration: 4 },
  { id: 'business', name: 'Business Administration', tuition: 20000, smartsReq: 40, duration: 4 },
  { id: 'biology', name: 'Pre-Med / Biology', tuition: 28000, smartsReq: 65, duration: 4 },
  { id: 'law_prep', name: 'Political Science / Pre-Law', tuition: 22000, smartsReq: 55, duration: 4 },
  { id: 'arts', name: 'Fine Arts & Drama', tuition: 18000, smartsReq: 30, duration: 4 },
  { id: 'engineering', name: 'Mechanical Engineering', tuition: 26000, smartsReq: 60, duration: 4 }
];

const GRAD_SCHOOLS = [
  { id: 'med_school', name: 'Medical School', tuition: 60000, smartsReq: 80, reqDegree: 'biology', duration: 4 },
  { id: 'law_school', name: 'Law School', tuition: 50000, smartsReq: 75, reqDegree: 'law_prep', duration: 3 },
  { id: 'business_school', name: 'MBA Program', tuition: 45000, smartsReq: 60, reqDegree: 'business', duration: 2 }
];

const CAREERS = [
  // Fast Food / Entry
  { id: 'cashier', title: 'Supermarket Cashier', category: 'Entry Level', baseSalary: 22000, reqDegree: null, reqSmarts: 0, reqLooks: 0, maxPromo: 'store_manager', stress: 20 },
  { id: 'fast_food', title: 'Fast Food Cook', category: 'Entry Level', baseSalary: 20000, reqDegree: null, reqSmarts: 0, reqLooks: 0, maxPromo: 'store_manager', stress: 30 },
  { id: 'janitor', title: 'School Custodian', category: 'Entry Level', baseSalary: 26000, reqDegree: null, reqSmarts: 0, reqLooks: 0, maxPromo: 'facilities_lead', stress: 15 },
  { id: 'store_manager', title: 'Retail Store Manager', category: 'Entry Level', baseSalary: 48000, reqDegree: null, reqSmarts: 35, reqLooks: 0, maxPromo: null, stress: 45 },

  // Tech / Software
  { id: 'junior_dev', title: 'Junior Software Engineer', category: 'Technology', baseSalary: 72000, reqDegree: 'cs', reqSmarts: 55, reqLooks: 0, maxPromo: 'senior_dev', stress: 40 },
  { id: 'senior_dev', title: 'Senior Software Engineer', category: 'Technology', baseSalary: 135000, reqDegree: 'cs', reqSmarts: 65, reqLooks: 0, maxPromo: 'tech_lead', stress: 50 },
  { id: 'tech_lead', title: 'VP of Engineering / CTO', category: 'Technology', baseSalary: 260000, reqDegree: 'cs', reqSmarts: 75, reqLooks: 0, maxPromo: null, stress: 70 },

  // Corporate / Finance
  { id: 'corp_analyst', title: 'Financial Analyst', category: 'Corporate', baseSalary: 68000, reqDegree: 'business', reqSmarts: 50, reqLooks: 0, maxPromo: 'corp_director', stress: 45 },
  { id: 'corp_director', title: 'Corporate Director', category: 'Corporate', baseSalary: 140000, reqDegree: 'business', reqSmarts: 65, reqLooks: 0, maxPromo: 'corp_ceo', stress: 60 },
  { id: 'corp_ceo', title: 'Chief Executive Officer (CEO)', category: 'Corporate', baseSalary: 450000, reqDegree: 'business', reqSmarts: 75, reqLooks: 40, maxPromo: null, stress: 85 },

  // Healthcare / Medical
  { id: 'nurse', title: 'Registered Nurse', category: 'Healthcare', baseSalary: 65000, reqDegree: 'biology', reqSmarts: 55, reqLooks: 0, maxPromo: 'head_nurse', stress: 55 },
  { id: 'physician', title: 'General Physician', category: 'Healthcare', baseSalary: 185000, reqDegree: 'med_school', reqSmarts: 80, reqLooks: 0, maxPromo: 'chief_surgeon', stress: 65 },
  { id: 'chief_surgeon', title: 'Chief Surgeon', category: 'Healthcare', baseSalary: 380000, reqDegree: 'med_school', reqSmarts: 88, reqLooks: 0, maxPromo: null, stress: 80 },

  // Aviation
  { id: 'flight_attendant', title: 'Flight Attendant', category: 'Aviation', baseSalary: 42000, reqDegree: null, reqSmarts: 30, reqLooks: 50, maxPromo: 'first_officer', stress: 35 },
  { id: 'first_officer', title: 'Commercial First Officer', category: 'Aviation', baseSalary: 88000, reqDegree: 'engineering', reqSmarts: 60, reqLooks: 0, maxPromo: 'airline_captain', stress: 55 },
  { id: 'airline_captain', title: 'Airline Captain Pilot', category: 'Aviation', baseSalary: 210000, reqDegree: 'engineering', reqSmarts: 70, reqLooks: 0, maxPromo: null, stress: 65 },

  // Showbiz & Fame
  { id: 'model', title: 'Fashion Runway Model', category: 'Entertainment', baseSalary: 55000, reqDegree: null, reqSmarts: 10, reqLooks: 80, maxPromo: 'supermodel', stress: 40, isFame: true },
  { id: 'supermodel', title: 'International Supermodel', category: 'Entertainment', baseSalary: 350000, reqDegree: null, reqSmarts: 10, reqLooks: 90, maxPromo: null, stress: 55, isFame: true },
  { id: 'indie_actor', title: 'Commercial Actor', category: 'Entertainment', baseSalary: 48000, reqDegree: 'arts', reqSmarts: 30, reqLooks: 60, maxPromo: 'movie_star', stress: 45, isFame: true },
  { id: 'movie_star', title: 'A-List Hollywood Movie Star', category: 'Entertainment', baseSalary: 750000, reqDegree: 'arts', reqSmarts: 40, reqLooks: 75, maxPromo: null, stress: 70, isFame: true },
  { id: 'pop_singer', title: 'Chart-Topping Pop Star', category: 'Entertainment', baseSalary: 820000, reqDegree: null, reqSmarts: 30, reqLooks: 70, maxPromo: null, stress: 75, isFame: true },

  // Politics & Law
  { id: 'associate_lawyer', title: 'Associate Attorney', category: 'Law & Politics', baseSalary: 95000, reqDegree: 'law_school', reqSmarts: 75, reqLooks: 0, maxPromo: 'law_partner', stress: 65 },
  { id: 'law_partner', title: 'Senior Law Partner', category: 'Law & Politics', baseSalary: 290000, reqDegree: 'law_school', reqSmarts: 80, reqLooks: 0, maxPromo: 'politician_mayor', stress: 75 },
  { id: 'politician_mayor', title: 'City Mayor', category: 'Law & Politics', baseSalary: 130000, reqDegree: 'law_prep', reqSmarts: 60, reqLooks: 50, maxPromo: 'politician_president', stress: 75, isFame: true },
  { id: 'politician_president', title: 'Head of State / President', category: 'Law & Politics', baseSalary: 400000, reqDegree: 'law_prep', reqSmarts: 75, reqLooks: 60, maxPromo: null, stress: 95, isFame: true },

  // Underworld / Mafia Syndicate
  { id: 'mob_associate', title: 'Syndicate Associate', category: 'Underworld', baseSalary: 40000, reqDegree: null, reqSmarts: 20, reqLooks: 0, maxPromo: 'mob_soldier', stress: 50, isCrime: true },
  { id: 'mob_soldier', title: 'Syndicate Enforcer', category: 'Underworld', baseSalary: 95000, reqDegree: null, reqSmarts: 30, reqLooks: 0, maxPromo: 'mob_capo', stress: 65, isCrime: true },
  { id: 'mob_capo', title: 'Syndicate Caporegime', category: 'Underworld', baseSalary: 240000, reqDegree: null, reqSmarts: 50, reqLooks: 0, maxPromo: 'mob_godfather', stress: 75, isCrime: true },
  { id: 'mob_godfather', title: 'Syndicate Don / Godfather', category: 'Underworld', baseSalary: 950000, reqDegree: null, reqSmarts: 70, reqLooks: 0, maxPromo: null, stress: 90, isCrime: true }
];

const REAL_ESTATE = [
  { id: 'studio', name: 'Cozy Downtown Studio', price: 120000, monthlyRent: 850, baseCondition: 80 },
  { id: 'suburb_house', name: 'Suburban 3-Bedroom Home', price: 340000, monthlyRent: 2200, baseCondition: 85 },
  { id: 'luxury_condo', name: 'High-Rise Glass Penthouse', price: 850000, monthlyRent: 5500, baseCondition: 95 },
  { id: 'country_estate', name: 'Historic Country Manor', price: 1900000, monthlyRent: 11000, baseCondition: 70 },
  { id: 'oceanfront_villa', name: 'Mediterranean Oceanfront Villa', price: 4500000, monthlyRent: 26000, baseCondition: 90 },
  { id: 'private_island', name: 'Caribbean Private Island Retreat', price: 15000000, monthlyRent: 80000, baseCondition: 95 }
];

const VEHICLES = [
  { id: 'used_sedan', name: 'Reliable Japanese Used Sedan', price: 6500, yearlyMaint: 400, speed: 40 },
  { id: 'electric_suv', name: 'Sleek Cyber Electric SUV', price: 48000, yearlyMaint: 900, speed: 70 },
  { id: 'sportscar', name: 'Italian Twin-Turbo V8 Sportscar', price: 165000, yearlyMaint: 4500, speed: 95 },
  { id: 'hypercar', name: 'Boutique Carbon Hypercar', price: 1200000, yearlyMaint: 25000, speed: 100 },
  { id: 'superyacht', name: '130-Foot Luxury Tri-Deck Superyacht', price: 8500000, yearlyMaint: 180000, speed: 50 },
  { id: 'private_jet', name: 'Twin-Engine Intercontinental Jet', price: 18000000, yearlyMaint: 450000, speed: 98 }
];

const STOCKS = [
  { id: 'aegis', ticker: 'AEGIS', name: 'Aegis BioTech', price: 45.0, volatility: 0.15, dividend: 0.02 },
  { id: 'nova', ticker: 'NOVA', name: 'Nova Cloud & AI', price: 180.0, volatility: 0.25, dividend: 0.00 },
  { id: 'titan', ticker: 'TITAN', name: 'Titan Global Energy', price: 92.0, volatility: 0.09, dividend: 0.045 },
  { id: 'solaris', ticker: 'SOLAR', name: 'Solaris Electric Motors', price: 210.0, volatility: 0.30, dividend: 0.00 },
  { id: 'btc', ticker: 'CRYPTO-B', name: 'BitOnyx Token', price: 3400.0, volatility: 0.45, dividend: 0.00 },
  { id: 'eth', ticker: 'CRYPTO-E', name: 'EtherFlow Protocol', price: 240.0, volatility: 0.50, dividend: 0.00 }
];

const AGE_EVENTS = {
  1: [
    { text: 'You took your very first wobbly steps across the living room carpet!', happiness: 5, health: 3 },
    { text: 'You said your first clear word: "Mama"!', happiness: 6, smarts: 2 },
    { text: 'You threw your strained peas onto the family dog. The dog was thrilled.', happiness: 4 }
  ],
  2: [
    { text: 'Your parents celebrated your 2nd birthday with an enormous dinosaur cake.', happiness: 8 },
    { text: 'You contracted an ear infection from the nursery ball pit.', health: -6, happiness: -4 }
  ],
  3: [
    { text: 'You mastered potty training without any accidents for three whole weeks!', smarts: 4, happiness: 5 },
    { text: 'You learned the alphabet song and recited it proudly to your grandmother.', smarts: 5 }
  ],
  4: [
    { text: 'You drew a colorful crayon mural on the freshly painted corridor wall.', smarts: 3, happiness: 4 },
    { text: 'You made your first best friend at the neighborhood sandbox.', happiness: 7 }
  ],
  5: [
    { text: 'You graduated kindergarten wearing a tiny cardboard cap and gown!', happiness: 10, smarts: 4 }
  ],
  6: [
    { text: 'You began 1st grade at Elementary School! You were assigned the front-row desk.', smarts: 3, happiness: 2 }
  ],
  10: [
    { text: 'You entered 5th grade and won 2nd place in the county Science Fair with a baking soda volcano!', smarts: 8, happiness: 7 }
  ],
  12: [
    { text: 'You started Middle School. The lockers are confusing and everyone seems suddenly awkward.', happiness: -3, smarts: 3 }
  ],
  14: [
    { text: 'You entered High School! You can now join extracurricular teams and get an allowance.', smarts: 4, looks: 3 }
  ],
  16: [
    { text: 'You turned 16! You are now eligible to study for your Driver’s License and take part-time work.', happiness: 10 }
  ],
  18: [
    { text: '🎓 You graduated from High School! The whole world lies ahead: University, Trade School, or the Workforce.', happiness: 12, smarts: 5 }
  ]
};

const RANDOM_DILEMMAS = [
  {
    minAge: 7, maxAge: 14,
    title: 'Schoolyard Bully',
    desc: 'A class bully pushes your friend against the swings and demands their snack money.',
    choices: [
      { text: 'Stand up to the bully and fight back', karma: 20, impact: { happiness: 10, health: -5, looks: -2, smarts: 2 }, result: 'You tackled the bully! You got a minor black eye, but earned legendary respect across the playground.' },
      { text: 'Tell the playground supervisor immediately', karma: 10, impact: { happiness: 2, smarts: 4 }, result: 'The teacher intervened. The bully was suspended for three days.' },
      { text: 'Look away and pretend you saw nothing', karma: -20, impact: { happiness: -8, smarts: -2 }, result: 'You felt guilty all afternoon while eating your lunch in silence.' }
    ]
  },
  {
    minAge: 15, maxAge: 20,
    title: 'Cheating Scandal',
    desc: 'Right before the brutal calculus final, a classmate offers you the leaked exam answer key on Telegram for $50.',
    choices: [
      { text: 'Refuse firmly and study all night with black coffee', karma: 15, impact: { smarts: 8, health: -4, happiness: 5 }, result: 'You grinded through the textbook and pulled off an honest A-!' },
      { text: 'Buy the answers and ace the test', karma: -25, impact: { smarts: -5, happiness: 8 }, result: 'You scored a 98%. You felt a knot of anxiety every time the teacher walked past.' },
      { text: 'Report the leak to the school principal', karma: -5, impact: { smarts: 4, happiness: -5 }, result: 'The exam was canceled. The whole class grumbled, but academic integrity held.' }
    ]
  },
  {
    minAge: 16, maxAge: 25,
    title: 'Street Drag Race',
    desc: 'A friend in a souped-up coupe pulls alongside you at a red light revving their engine and daring you to race.',
    choices: [
      { text: 'Floor the pedal and race them down the strip!', karma: -10, impact: { happiness: 12, health: -8 }, result: 'You hit 110 mph! Your tires smoked, but you barely missed a concrete median.' },
      { text: 'Wave them off and drive calmly at the speed limit', karma: 10, impact: { happiness: 0, smarts: 4 }, result: 'A cop cruiser flashed its lights half a mile down and pulled them over instead!' }
    ]
  },
  {
    minAge: 18, maxAge: 75,
    title: 'Found Wallet on Subway',
    desc: 'You spot a designer leather wallet dropped under a subway bench containing $850 in cash and an ID card.',
    choices: [
      { text: 'Track down the owner and return everything intact', karma: 30, impact: { happiness: 15, smarts: 2 }, cash: 100, result: 'The owner was a tearful retired nurse who rewarded you with $100 and warm cookies.' },
      { text: 'Pocket the cash and discard the wallet in a bin', karma: -35, impact: { happiness: 5 }, cash: 850, result: 'Your wallet feels heavier with $850, but your conscience twinges whenever you walk past that station.' },
      { text: 'Hand it over to transit lost and found', karma: 15, impact: { happiness: 6 }, result: 'You handed it to the booth agent and walked away feeling like a responsible citizen.' }
    ]
  },
  {
    minAge: 22, maxAge: 65,
    title: 'Insider Stock Whisper',
    desc: 'A drunken corporate executive at a lounge party whispers that a mega-merger will be announced for a pharmaceutical stock tomorrow.',
    choices: [
      { text: 'Dump $5,000 of your savings into the stock right now', karma: -20, impact: { happiness: 10 }, chanceResult: {
        successProb: 0.65,
        win: { cash: 18000, text: 'The stock soared 360% at market open! You cashed out with massive gains.' },
        lose: { cash: -5000, text: 'The SEC suspended trading on suspicious volume! Your money was frozen.' }
      } },
      { text: 'Report the insider leak to financial regulators', karma: 25, impact: { smarts: 5, happiness: 5 }, result: 'Whistleblower bounty: You received a clean $2,500 civic appreciation check.', cash: 2500 },
      { text: 'Ignore the drunk chatter and stick to index funds', karma: 5, impact: { smarts: 3 }, result: 'Slow, steady, and sleep soundly at night.' }
    ]
  },
  {
    minAge: 25, maxAge: 70,
    title: 'Runaway Dog in Traffic',
    desc: 'A terrified golden retriever puppy is darting across four lanes of rush-hour highway traffic!',
    choices: [
      { text: 'Dash into traffic with arms waving to stop cars and save the puppy!', karma: 40, impact: { happiness: 20, health: -10 }, result: 'You scooped up the puppy just before a truck braked! The crowd applauded and news cameras filmed you.' },
      { text: 'Call emergency animal control from the sidewalk', karma: 10, impact: { happiness: 5 }, result: 'Rescuers arrived 15 minutes later and successfully guided the dog off the roadway.' },
      { text: 'Keep walking; not your problem', karma: -30, impact: { happiness: -12 }, result: 'You walked away feeling cold and hollow inside.' }
    ]
  },
  {
    minAge: 20, maxAge: 80,
    title: 'Mysterious Antique Vase',
    desc: 'At an estate yard sale, you notice a dusty vase with an ancient seal that looks suspiciously like genuine 17th-century porcelain priced for $15.',
    choices: [
      { text: 'Buy it instantly for $15 and take it to an appraiser', karma: 0, impact: { smarts: 5 }, chanceResult: {
        successProb: 0.5,
        win: { cash: 32000, text: 'The appraiser gasped! It was an authenticated imperial antique worth $32,000 at auction!' },
        lose: { cash: -15, text: 'The appraiser chuckled: it was a 1982 souvenir replica made of resin.' }
      } },
      { text: 'Tell the sweet elderly seller that it might be an invaluable antique', karma: 30, impact: { happiness: 18, smarts: 4 }, result: 'She shed tears of gratitude. Her family auctioned it and sent you a $3,000 thank-you check.', cash: 3000 }
    ]
  }
];

const RIBBONS = [
  { id: 'loaded', title: 'Loaded', icon: '💰', desc: 'Amassed an empire of over $10,000,000 in net worth.' },
  { id: 'superstar', title: 'Superstar', icon: '🌟', desc: 'Achieved world fame as an actor, pop icon, or head of state.' },
  { id: 'hero', title: 'Hero', icon: '🦸', desc: 'Dedicated your life to saving others, medical excellence, and selfless karma.' },
  { id: 'wicked', title: 'Wicked', icon: '😈', desc: 'Led a ruthless life of syndicate crime, bank heists, and prison breaks.' },
  { id: 'academic', title: 'Academic', icon: '🎓', desc: 'Graduated university with peak smarts and pursued elite professional degrees.' },
  { id: 'scandalous', title: 'Scandalous', icon: '💔', desc: 'Left a trail of broken marriages, public lawsuits, and explosive affairs.' },
  { id: 'centenarian', title: 'Centenarian', icon: '🎂', desc: 'Defied human biology and lived past 100 years of age.' },
  { id: 'jailbird', title: 'Jailbird', icon: '⛓️', desc: 'Spent more than two decades behind cold steel bars.' },
  { id: 'family_first', title: 'Family Anchor', icon: '👨‍👩‍👧‍👦', desc: 'Raised 3+ children, remained happily married, and nurtured a loving clan.' },
  { id: 'mediocre', title: 'Mediocre', icon: '🛋️', desc: 'Lived a quiet, unremarkable, everyday existence.' }
];

// --- SECTION 2: PROCEDURAL WEB AUDIO API SYNTHESIZER ---
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && (typeof window !== 'undefined')) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch(e) {}
  }

  playAgeUp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch(e) {}
  }

  playCash() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [987.77, 1318.51].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch(e) {}
  }

  playDilemma() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.15);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch(e) {}
  }

  playSiren() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.25);
      osc.frequency.linearRampToValueAtTime(600, now + 0.5);
      osc.frequency.linearRampToValueAtTime(900, now + 0.75);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch(e) {}
  }

  playPrisonDoor() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch(e) {}
  }

  playDeath() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [392, 369.99, 349.23, 293.66];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.22;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.6);
      });
    } catch(e) {}
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.8);
      });
    } catch(e) {}
  }
}

const sound = new SoundFX();

// --- SECTION 3: SIMULATION ENGINE ---
class LifeLinesEngine {
  constructor() {
    this.generation = 1;
    this.familyDynasty = 'First Generation';
    this.character = null;
    this.history = [];
    this.activeTab = 'log';
    this.pendingDilemma = null;
    this.inPrisonBreak = false;
    this.prisonGameState = null;

    this.initDOM();
    this.startNewLife();
  }

  randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  clamp(val, min = 0, max = 100) {
    return Math.max(min, Math.min(max, val));
  }

  formatMoney(num) {
    const cur = this.character ? this.character.country.currency : '$';
    if (Math.abs(num) >= 1e6) {
      return cur + (num / 1e6).toFixed(2) + 'M';
    }
    return cur + num.toLocaleString();
  }

  startNewLife(heirData = null) {
    if (heirData) {
      this.generation++;
      this.character = {
        name: heirData.name,
        gender: heirData.gender,
        age: heirData.age,
        country: heirData.country || this.character.country,
        city: heirData.city || this.character.city,
        happiness: heirData.happiness || 85,
        health: heirData.health || 95,
        smarts: heirData.smarts || this.randInt(50, 95),
        looks: heirData.looks || this.randInt(40, 95),
        cash: heirData.cash || 0,
        karma: 50,
        fame: 0,
        isAlive: true,
        inPrison: false,
        prisonYearsLeft: 0,
        education: heirData.education || 'High School',
        degrees: heirData.degrees || [],
        job: null,
        jobPerformance: 50,
        partner: null,
        children: [],
        parents: [],
        siblings: [],
        pets: [],
        realEstate: heirData.realEstate || [],
        vehicles: [],
        portfolio: {},
        willHeirIndex: 0,
        stats: {
          crimesCommitted: 0,
          heistsSucceeded: 0,
          totalEarned: heirData.cash || 0,
          yearsInPrison: 0,
          loversCount: 0
        }
      };
      this.history = [{
        year: this.character.age,
        events: [`You continued the family legacy as ${this.character.name}! You inherited ${this.formatMoney(this.character.cash)}.`]
      }];
    } else {
      const country = this.randChoice(COUNTRIES);
      const city = this.randChoice(country.cities);
      const gender = Math.random() > 0.5 ? 'M' : 'F';
      const firstName = gender === 'M' ? this.randChoice(FIRST_NAMES_MALE) : this.randChoice(FIRST_NAMES_FEMALE);
      const lastName = this.randChoice(LAST_NAMES);

      const fatherAge = this.randInt(22, 42);
      const motherAge = this.randInt(20, 40);
      const parents = [
        { name: `${this.randChoice(FIRST_NAMES_MALE)} ${lastName}`, relation: 'Father', age: fatherAge, job: this.randChoice(PARENT_OCCUPATIONS), relationship: this.randInt(75, 100) },
        { name: `${this.randChoice(FIRST_NAMES_FEMALE)} ${lastName}`, relation: 'Mother', age: motherAge, job: this.randChoice(PARENT_OCCUPATIONS), relationship: this.randInt(75, 100) }
      ];

      const siblings = [];
      const numSiblings = Math.random() > 0.4 ? this.randInt(1, 2) : 0;
      for (let i = 0; i < numSiblings; i++) {
        const sGender = Math.random() > 0.5 ? 'M' : 'F';
        const sName = sGender === 'M' ? this.randChoice(FIRST_NAMES_MALE) : this.randChoice(FIRST_NAMES_FEMALE);
        siblings.push({
          name: `${sName} ${lastName}`,
          relation: sGender === 'M' ? 'Brother' : 'Sister',
          age: this.randInt(1, 6),
          relationship: this.randInt(70, 95)
        });
      }

      this.character = {
        name: `${firstName} ${lastName}`,
        gender,
        age: 0,
        country,
        city,
        happiness: this.randInt(80, 100),
        health: this.randInt(85, 100),
        smarts: this.randInt(25, 95),
        looks: this.randInt(25, 95),
        cash: 0,
        karma: 50,
        fame: 0,
        isAlive: true,
        inPrison: false,
        prisonYearsLeft: 0,
        education: 'Infant',
        degrees: [],
        job: null,
        jobPerformance: 50,
        partner: null,
        children: [],
        parents,
        siblings,
        pets: [],
        realEstate: [],
        vehicles: [],
        portfolio: {},
        willHeirIndex: 0,
        stats: {
          crimesCommitted: 0,
          heistsSucceeded: 0,
          totalEarned: 0,
          yearsInPrison: 0,
          loversCount: 0
        }
      };

      this.history = [{
        year: 0,
        events: [
          `You were born in ${city}, ${country.name}.`,
          `Your mother is ${parents[1].name}, a ${parents[1].job} (age ${parents[1].age}).`,
          `Your father is ${parents[0].name}, a ${parents[0].job} (age ${parents[0].age}).`
        ]
      }];
    }

    this.renderAll();
  }

  getAvatar() {
    const { age, gender, isAlive, looks } = this.character;
    if (!isAlive) return '🪦';
    if (age <= 2) return '👶';
    if (age <= 12) return gender === 'M' ? '👦' : '👧';
    if (age <= 24) return gender === 'M' ? '🧑' : '👱‍♀️';
    if (age <= 60) {
      if (looks >= 80) return gender === 'M' ? '🕺' : '💃';
      return gender === 'M' ? '👨' : '👩';
    }
    return gender === 'M' ? '👴' : '👵';
  }

  ageUp() {
    if (!this.character.isAlive) return;

    sound.playAgeUp();
    this.character.age += 1;
    const currentYearEvents = [];

    this.character.parents.forEach(p => p.age += 1);
    this.character.siblings.forEach(s => s.age += 1);
    this.character.children.forEach(c => c.age += 1);
    if (this.character.partner) this.character.partner.age += 1;

    // 1. Incarceration Check
    if (this.character.inPrison) {
      this.character.stats.yearsInPrison += 1;
      this.character.prisonYearsLeft -= 1;
      this.character.happiness = this.clamp(this.character.happiness - 8);
      this.character.health = this.clamp(this.character.health - 5);
      currentYearEvents.push({ text: `You spent another grueling year in prison. (${this.character.prisonYearsLeft} years remaining)` });

      if (this.character.prisonYearsLeft <= 0) {
        this.character.inPrison = false;
        sound.playFanfare();
        currentYearEvents.push({ text: '🔓 You were released from prison after serving your full sentence!' });
      }
    } else {
      // 2. Financial Calculations
      let annualIncome = 0;
      if (this.character.job) {
        annualIncome += this.character.job.baseSalary;
        this.character.stats.totalEarned += this.character.job.baseSalary;
      }

      let rentalIncome = 0;
      let propertyTax = 0;
      this.character.realEstate.forEach(prop => {
        prop.condition = this.clamp(prop.condition - this.randInt(2, 5));
        if (prop.isRented && prop.condition > 40) {
          rentalIncome += prop.monthlyRent * 12;
        }
        propertyTax += Math.round(prop.price * 0.012);
      });

      let vehicleMaint = 0;
      this.character.vehicles.forEach(v => {
        vehicleMaint += v.yearlyMaint;
      });

      let portfolioReturn = 0;
      for (const [stockId, shares] of Object.entries(this.character.portfolio)) {
        if (shares > 0) {
          const stock = STOCKS.find(s => s.id === stockId);
          if (stock) {
            const swing = (Math.random() * 2 - 1) * stock.volatility;
            stock.price = Math.max(1, Math.round(stock.price * (1 + swing) * 100) / 100);
            if (stock.dividend > 0) {
              portfolioReturn += Math.round(shares * stock.price * stock.dividend);
            }
          }
        }
      }

      const grossIncome = annualIncome + rentalIncome + portfolioReturn;
      const tax = Math.round(grossIncome * this.character.country.taxRate);
      const livingCost = this.character.age >= 18 ? 12000 : 0;
      const netGain = grossIncome - tax - livingCost - propertyTax - vehicleMaint;

      this.character.cash += netGain;

      if (this.character.job) {
        currentYearEvents.push({ text: `You received your annual salary of ${this.formatMoney(this.character.job.baseSalary)} from ${this.character.job.title}.` });
      }
      if (rentalIncome > 0) {
        currentYearEvents.push({ text: `Your rental properties generated ${this.formatMoney(rentalIncome)} in passive rental income.` });
      }
    }

    // 3. Health & Age Decay
    if (this.character.age >= 60) {
      const decay = Math.round((this.character.age - 55) * 0.35);
      this.character.health = this.clamp(this.character.health - this.randInt(2, decay + 3));
    }

    if (Math.random() < 0.12 && this.character.age > 8) {
      const illnesses = [
        { name: 'Common Flu', hp: -8, hap: -6 },
        { name: 'Migraines', hp: -5, hap: -8 },
        { name: 'High Blood Pressure', hp: -12, hap: -5 },
        { name: 'Food Poisoning', hp: -10, hap: -10 }
      ];
      const ill = this.randChoice(illnesses);
      this.character.health = this.clamp(this.character.health + ill.hp);
      this.character.happiness = this.clamp(this.character.happiness + ill.hap);
      currentYearEvents.push({ text: `🩺 You were diagnosed with ${ill.name}.` });
    }

    // 4. Milestone Triggers
    if (this.character.age === 6) {
      this.character.education = 'Elementary School';
      currentYearEvents.push({ text: '🎒 You started Elementary School! Your parents packed your favorite lunch.' });
    } else if (this.character.age === 12) {
      this.character.education = 'Middle School';
      currentYearEvents.push({ text: '🏫 You entered Middle School. Academic pressure begins to mount.' });
    } else if (this.character.age === 14) {
      this.character.education = 'High School';
      currentYearEvents.push({ text: '🎉 You entered High School! You can now join sports, clubs, and socialize.' });
    } else if (this.character.age === 16) {
      currentYearEvents.push({ text: '🚗 Sweet Sixteen! You can now apply for your Driver’s License and look for entry-level gigs.' });
    } else if (this.character.age === 18) {
      this.character.education = 'High School Graduate';
      currentYearEvents.push({ text: '🎓 You graduated High School! You can now seek university admission or start working.' });
    }

    // 5. Preset Age Events
    if (AGE_EVENTS[this.character.age]) {
      const ev = this.randChoice(AGE_EVENTS[this.character.age]);
      if (ev.happiness) this.character.happiness = this.clamp(this.character.happiness + ev.happiness);
      if (ev.health) this.character.health = this.clamp(this.character.health + ev.health);
      if (ev.smarts) this.character.smarts = this.clamp(this.character.smarts + ev.smarts);
      if (ev.looks) this.character.looks = this.clamp(this.character.looks + ev.looks);
      currentYearEvents.push({ text: ev.text });
    }

    // 6. Natural Death Check
    const deathProb = this.calculateDeathProbability();
    if (this.character.health <= 0 || Math.random() < deathProb) {
      this.killCharacter(this.character.health <= 0 ? 'Poor health and systemic exhaustion' : 'Old age peacefully in sleep');
      return;
    }

    this.history.unshift({
      year: this.character.age,
      events: currentYearEvents.map(e => e.text || e)
    });

    // 7. Dilemma Trigger
    const validDilemmas = RANDOM_DILEMMAS.filter(d => this.character.age >= d.minAge && this.character.age <= d.maxAge);
    if (validDilemmas.length > 0 && Math.random() < 0.45 && !this.character.inPrison) {
      const selected = this.randChoice(validDilemmas);
      this.triggerDilemma(selected);
    }

    this.renderAll();
  }

  calculateDeathProbability() {
    const age = this.character.age;
    if (age < 70) return 0;
    if (age < 85) return (age - 70) * 0.015;
    if (age < 100) return 0.25 + (age - 85) * 0.035;
    return 0.70 + (age - 100) * 0.05;
  }

  triggerDilemma(dilemma) {
    this.pendingDilemma = dilemma;
    sound.playDilemma();

    const modal = document.getElementById('decisionModal');
    const title = document.getElementById('modalTitle');
    const desc = document.getElementById('modalDesc');
    const optionsBox = document.getElementById('modalOptions');

    title.textContent = dilemma.title;
    desc.textContent = dilemma.desc;
    optionsBox.innerHTML = '';

    dilemma.choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.className = 'btn-option';
      btn.textContent = choice.text;
      btn.addEventListener('click', () => {
        this.resolveDilemmaChoice(choice);
        modal.classList.remove('active');
        this.renderAll();
      });
      optionsBox.appendChild(btn);
    });

    modal.classList.add('active');
  }

  resolveDilemmaChoice(choice) {
    let outcomeText = choice.result || '';
    if (choice.karma) this.character.karma += choice.karma;

    if (choice.impact) {
      if (choice.impact.happiness) this.character.happiness = this.clamp(this.character.happiness + choice.impact.happiness);
      if (choice.impact.health) this.character.health = this.clamp(this.character.health + choice.impact.health);
      if (choice.impact.smarts) this.character.smarts = this.clamp(this.character.smarts + choice.impact.smarts);
      if (choice.impact.looks) this.character.looks = this.clamp(this.character.looks + choice.impact.looks);
    }

    if (choice.cash) {
      this.character.cash += choice.cash;
      if (choice.cash > 0) sound.playCash();
    }

    if (choice.chanceResult) {
      const success = Math.random() < choice.chanceResult.successProb;
      const res = success ? choice.chanceResult.win : choice.chanceResult.lose;
      outcomeText = res.text;
      if (res.cash) this.character.cash += res.cash;
    }

    if (this.history[0]) {
      this.history[0].events.push(outcomeText);
    }
  }

  studyHarder() {
    sound.playClick();
    this.character.smarts = this.clamp(this.character.smarts + this.randInt(3, 7));
    this.character.happiness = this.clamp(this.character.happiness - 2);
    alert('📚 You studied with intense discipline! Your grades improved and your Smarts increased.');
    this.renderAll();
  }

  enrollDegree(degreeId) {
    const degree = DEGREES.find(d => d.id === degreeId);
    if (!degree) return;

    if (this.character.smarts < degree.smartsReq) {
      alert(`❌ The admissions board rejected your application! Minimum required smarts: ${degree.smartsReq}% (Your smarts: ${this.character.smarts}%).`);
      return;
    }

    if (this.character.cash < degree.tuition) {
      alert(`❌ You cannot afford tuition of ${this.formatMoney(degree.tuition)}! Work or save up first.`);
      return;
    }

    sound.playCash();
    this.character.cash -= degree.tuition;
    this.character.degrees.push(degree.id);
    this.character.education = `Degree in ${degree.name}`;
    this.character.smarts = this.clamp(this.character.smarts + 10);
    this.character.happiness = this.clamp(this.character.happiness + 8);
    alert(`🎓 Congratulations! You enrolled in and earned your ${degree.name} degree!`);
    this.renderAll();
  }

  enrollGradSchool(gradId) {
    const school = GRAD_SCHOOLS.find(s => s.id === gradId);
    if (!school) return;

    if (!this.character.degrees.includes(school.reqDegree)) {
      alert(`❌ You do not hold the required prerequisite undergraduate degree!`);
      return;
    }

    if (this.character.smarts < school.smartsReq) {
      alert(`❌ The graduate committee rejected your score. Required Smarts: ${school.smartsReq}%.`);
      return;
    }

    if (this.character.cash < school.tuition) {
      alert(`❌ Insufficient funds for graduate tuition of ${this.formatMoney(school.tuition)}.`);
      return;
    }

    sound.playCash();
    this.character.cash -= school.tuition;
    this.character.degrees.push(school.id);
    this.character.education = school.name;
    this.character.smarts = this.clamp(this.character.smarts + 12);
    alert(`🎓 You successfully graduated from ${school.name}!`);
    this.renderAll();
  }

  applyJob(jobId) {
    const job = CAREERS.find(j => j.id === jobId);
    if (!job) return;

    if (this.character.age < 18 && job.category !== 'Entry Level') {
      alert('❌ You must be at least 18 years old for this position.');
      return;
    }

    if (job.reqDegree && !this.character.degrees.includes(job.reqDegree)) {
      alert(`❌ This career requires an accredited degree.`);
      return;
    }

    if (this.character.smarts < job.reqSmarts) {
      alert(`❌ The interview board found your qualifications insufficient (Requires ${job.reqSmarts}% Smarts).`);
      return;
    }

    if (job.reqLooks > 0 && this.character.looks < job.reqLooks) {
      alert(`❌ The casting agency deemed your look didn't fit their commercial brand.`);
      return;
    }

    sound.playFanfare();
    this.character.job = { ...job };
    this.character.jobPerformance = 60;
    if (job.isFame) this.character.fame = Math.max(30, this.character.fame + 25);
    alert(`🎉 You were hired as ${job.title}! Starting annual salary: ${this.formatMoney(job.baseSalary)}.`);
    this.renderAll();
  }

  workHarder() {
    if (!this.character.job) return;
    sound.playClick();
    this.character.jobPerformance = this.clamp(this.character.jobPerformance + 15);
    this.character.happiness = this.clamp(this.character.happiness - 4);
    alert(`💼 You stayed overtime, fixed critical bugs, and impressed your supervisor! (Performance: ${this.character.jobPerformance}%)`);
    this.renderAll();
  }

  askForRaise() {
    if (!this.character.job) return;
    if (this.character.jobPerformance >= 70) {
      sound.playCash();
      const bump = Math.round(this.character.job.baseSalary * 0.12);
      this.character.job.baseSalary += bump;
      this.character.happiness = this.clamp(this.character.happiness + 8);
      alert(`💰 Success! Your boss recognized your dedication and bumped your salary by ${this.formatMoney(bump)}/yr!`);
    } else {
      alert('❌ Your supervisor scoffed at your request. "Show more results before asking for raises!"');
      this.character.happiness = this.clamp(this.character.happiness - 4);
    }
    this.renderAll();
  }

  askForPromotion() {
    if (!this.character.job) return;
    const currentId = this.character.job.id;
    const currentCareer = CAREERS.find(c => c.id === currentId);

    if (!currentCareer || !currentCareer.maxPromo) {
      alert('⭐ You are already at the pinnacle of this career track!');
      return;
    }

    if (this.character.jobPerformance >= 80) {
      const nextJob = CAREERS.find(c => c.id === currentCareer.maxPromo);
      if (nextJob) {
        sound.playFanfare();
        this.character.job = { ...nextJob };
        this.character.jobPerformance = 60;
        this.character.happiness = this.clamp(this.character.happiness + 15);
        alert(`🌟 PROMOTED! You ascended to ${nextJob.title} with a salary of ${this.formatMoney(nextJob.baseSalary)}!`);
      }
    } else {
      alert('❌ The executive board passed you over for a promotion this cycle.');
    }
    this.renderAll();
  }

  resignJob() {
    if (!this.character.job) return;
    if (confirm(`Are you sure you want to resign from your position as ${this.character.job.title}?`)) {
      this.character.job = null;
      this.character.jobPerformance = 50;
      alert('You cleared out your desk and resigned.');
      this.renderAll();
    }
  }

  interactPerson(person, type) {
    sound.playClick();
    if (type === 'spend_time') {
      person.relationship = this.clamp(person.relationship + this.randInt(5, 12));
      this.character.happiness = this.clamp(this.character.happiness + 5);
      alert(`☕ You spent quality time together chatting about life.`);
    } else if (type === 'compliment') {
      person.relationship = this.clamp(person.relationship + this.randInt(4, 9));
      alert(`💬 You gave them a heartfelt compliment. They beamed with joy.`);
    } else if (type === 'gift') {
      if (this.character.cash < 250) {
        alert('❌ You need at least $250 to buy a thoughtful gift.');
        return;
      }
      this.character.cash -= 250;
      sound.playCash();
      person.relationship = this.clamp(person.relationship + 15);
      alert(`🎁 You gifted them a luxury fragrance set! They loved it.`);
    } else if (type === 'ask_money') {
      if (person.relationship > 60) {
        const gift = this.randInt(100, 800);
        this.character.cash += gift;
        sound.playCash();
        alert(`💵 They graciously handed you ${this.formatMoney(gift)}.`);
      } else {
        alert(`❌ They told you to get a job and stop asking for handouts.`);
        person.relationship = this.clamp(person.relationship - 5);
      }
    }
    this.renderAll();
  }

  findDate() {
    if (this.character.age < 16) {
      alert('❌ You are too young for the dating scene!');
      return;
    }
    if (this.character.partner) {
      alert(`⚠️ You are already dating ${this.character.partner.name}! Break up first.`);
      return;
    }

    const pGender = this.character.gender === 'M' ? 'F' : 'M';
    const pFirst = pGender === 'M' ? this.randChoice(FIRST_NAMES_MALE) : this.randChoice(FIRST_NAMES_FEMALE);
    const pLast = this.randChoice(LAST_NAMES);
    const candidate = {
      name: `${pFirst} ${pLast}`,
      age: this.randInt(Math.max(16, this.character.age - 3), this.character.age + 4),
      gender: pGender,
      job: this.randChoice(PARENT_OCCUPATIONS),
      looks: this.randInt(40, 95),
      smarts: this.randInt(40, 95),
      relationship: 75,
      isMarried: false
    };

    if (confirm(`💘 You matched with ${candidate.name} (Age ${candidate.age}, ${candidate.job}, ${candidate.looks}% Looks)! Would you like to ask them out?`)) {
      sound.playFanfare();
      this.character.partner = candidate;
      this.character.happiness = this.clamp(this.character.happiness + 15);
      this.character.stats.loversCount++;
      alert(`❤️ You and ${candidate.name} are now officially dating!`);
      this.renderAll();
    }
  }

  proposeMarriage() {
    if (!this.character.partner) return;
    if (this.character.partner.isMarried) {
      alert('You are already married!');
      return;
    }

    if (this.character.cash < 5000) {
      alert('❌ You need at least $5,000 to buy an engagement ring and host a wedding ceremony.');
      return;
    }

    this.character.cash -= 5000;
    sound.playFanfare();
    this.character.partner.isMarried = true;
    this.character.happiness = this.clamp(this.character.happiness + 25);
    alert(`💍 ${this.character.partner.name} said YES! You had a beautiful wedding celebration!`);
    this.renderAll();
  }

  haveBaby() {
    if (!this.character.partner) {
      alert('❌ You need a romantic partner to try for a baby!');
      return;
    }

    const babyGender = Math.random() > 0.5 ? 'M' : 'F';
    const bName = babyGender === 'M' ? this.randChoice(FIRST_NAMES_MALE) : this.randChoice(FIRST_NAMES_FEMALE);
    const child = {
      name: `${bName} ${this.character.name.split(' ')[1]}`,
      gender: babyGender,
      age: 0,
      relationship: 95,
      smarts: this.randInt(40, 95),
      looks: this.randInt(40, 95)
    };

    sound.playFanfare();
    this.character.children.push(child);
    this.character.happiness = this.clamp(this.character.happiness + 20);
    alert(`👶 Congratulations! You welcomed a healthy baby ${babyGender === 'M' ? 'boy' : 'girl'}, ${child.name}!`);
    this.renderAll();
  }

  divorcePartner() {
    if (!this.character.partner) return;
    if (confirm(`Are you sure you want to divorce ${this.character.partner.name}? Assets may be split.`)) {
      if (this.character.partner.isMarried) {
        const splitCash = Math.round(this.character.cash * 0.4);
        this.character.cash -= splitCash;
        alert(`💔 Divorce finalized. Legal settlements and division of property cost you ${this.formatMoney(splitCash)}.`);
      } else {
        alert(`💔 You broke up with ${this.character.partner.name}.`);
      }
      this.character.partner = null;
      this.character.happiness = this.clamp(this.character.happiness - 20);
      this.renderAll();
    }
  }

  buyProperty(propId) {
    const prop = REAL_ESTATE.find(p => p.id === propId);
    if (!prop) return;

    if (this.character.cash < prop.price) {
      alert(`❌ Insufficient funds. You need ${this.formatMoney(prop.price)}.`);
      return;
    }

    sound.playCash();
    this.character.cash -= prop.price;
    this.character.realEstate.push({
      ...prop,
      condition: prop.baseCondition,
      isRented: true
    });
    alert(`🏡 You purchased ${prop.name}! You immediately found tenants for passive income.`);
    this.renderAll();
  }

  renovateProperty(index) {
    const prop = this.character.realEstate[index];
    if (!prop) return;

    const cost = Math.round(prop.price * 0.05);
    if (this.character.cash < cost) {
      alert(`❌ Renovation costs ${this.formatMoney(cost)}. You don't have enough cash.`);
      return;
    }

    sound.playCash();
    this.character.cash -= cost;
    prop.condition = 100;
    alert(`🔨 Renovations complete! Condition restored to 100%.`);
    this.renderAll();
  }

  sellProperty(index) {
    const prop = this.character.realEstate[index];
    if (!prop) return;

    const marketValue = Math.round(prop.price * (prop.condition / 100));
    sound.playCash();
    this.character.cash += marketValue;
    this.character.realEstate.splice(index, 1);
    alert(`🏷️ You sold ${prop.name} for ${this.formatMoney(marketValue)}!`);
    this.renderAll();
  }

  buyVehicle(vehId) {
    const veh = VEHICLES.find(v => v.id === vehId);
    if (!veh) return;

    if (this.character.cash < veh.price) {
      alert(`❌ You cannot afford this vehicle (${this.formatMoney(veh.price)}).`);
      return;
    }

    sound.playCash();
    this.character.cash -= veh.price;
    this.character.vehicles.push({ ...veh, condition: 100 });
    this.character.happiness = this.clamp(this.character.happiness + 15);
    alert(`🏎️ You bought the ${veh.name}! Heads turn whenever you cruise by.`);
    this.renderAll();
  }

  tradeStock(stockId, sharesToBuy) {
    const stock = STOCKS.find(s => s.id === stockId);
    if (!stock) return;

    const totalCost = Math.round(stock.price * sharesToBuy);
    if (sharesToBuy > 0) {
      if (this.character.cash < totalCost) {
        alert('❌ Insufficient cash to purchase these shares.');
        return;
      }
      sound.playCash();
      this.character.cash -= totalCost;
      this.character.portfolio[stockId] = (this.character.portfolio[stockId] || 0) + sharesToBuy;
      alert(`📈 Purchased ${sharesToBuy} units of ${stock.ticker} for ${this.formatMoney(totalCost)}.`);
    } else {
      const sellCount = Math.abs(sharesToBuy);
      const held = this.character.portfolio[stockId] || 0;
      if (held < sellCount) {
        alert('❌ You do not own that many shares to sell.');
        return;
      }
      sound.playCash();
      const revenue = Math.round(stock.price * sellCount);
      this.character.cash += revenue;
      this.character.portfolio[stockId] -= sellCount;
      alert(`📉 Sold ${sellCount} units of ${stock.ticker} for ${this.formatMoney(revenue)}.`);
    }
    this.renderAll();
  }

  commitPettyCrime() {
    sound.playClick();
    this.character.stats.crimesCommitted++;
    const roll = Math.random();

    if (roll < 0.65) {
      const loot = this.randInt(60, 450);
      this.character.cash += loot;
      sound.playCash();
      alert(`💰 Pickpocket success! You swiped a designer purse and pocketed ${this.formatMoney(loot)}.`);
    } else {
      sound.playSiren();
      alert(`🚨 A vigilant undercover cop spotted you and tackled you to the pavement!`);
      this.getArrested('Grand Larceny & Pickpocketing', 2);
    }
    this.renderAll();
  }

  commitBankHeist() {
    sound.playClick();
    this.character.stats.crimesCommitted++;
    const roll = Math.random();

    if (roll < 0.40) {
      const loot = this.randInt(150000, 650000);
      this.character.cash += loot;
      this.character.stats.heistsSucceeded++;
      sound.playFanfare();
      alert(`🏦 HEIST MASTERPIECE! You drilled the safety deposit vault and escaped with ${this.formatMoney(loot)}!`);
    } else {
      sound.playSiren();
      alert(`🚨 Silent alarm triggered! SWAT cruisers blockaded all perimeter exits.`);
      this.getArrested('Armed Commercial Bank Robbery', this.randInt(8, 15));
    }
    this.renderAll();
  }

  getArrested(crimeName, sentenceYears) {
    this.character.inPrison = true;
    this.character.prisonYearsLeft = sentenceYears;
    this.character.happiness = this.clamp(this.character.happiness - 35);
    sound.playPrisonDoor();

    const modal = document.getElementById('decisionModal');
    const title = document.getElementById('modalTitle');
    const desc = document.getElementById('modalDesc');
    const optionsBox = document.getElementById('modalOptions');

    title.textContent = `Arrested for ${crimeName}`;
    desc.textContent = `You are facing up to ${sentenceYears} years in high-security prison. Choose your legal defense strategy:`;
    optionsBox.innerHTML = '';

    const eliteBtn = document.createElement('button');
    eliteBtn.className = 'btn-option';
    eliteBtn.textContent = 'Hire Elite Defense Attorney ($25,000)';
    eliteBtn.addEventListener('click', () => {
      if (this.character.cash >= 25000) {
        this.character.cash -= 25000;
        if (Math.random() < 0.70) {
          this.character.inPrison = false;
          this.character.prisonYearsLeft = 0;
          sound.playFanfare();
          alert('⚖️ ACQUITTED! Your attorney found a procedural error with evidence handling. All charges dismissed!');
        } else {
          this.character.prisonYearsLeft = Math.max(1, Math.round(sentenceYears / 2));
          alert(`⚖️ The jury found you guilty, but your lawyer reduced your sentence to ${this.character.prisonYearsLeft} years.`);
        }
      } else {
        alert('❌ You do not have $25,000 for elite counsel. Assigned a public defender.');
        this.resolvePublicDefender(sentenceYears);
      }
      modal.classList.remove('active');
      this.renderAll();
    });
    optionsBox.appendChild(eliteBtn);

    const pubBtn = document.createElement('button');
    pubBtn.className = 'btn-option';
    pubBtn.textContent = 'Use Free Public Defender';
    pubBtn.addEventListener('click', () => {
      this.resolvePublicDefender(sentenceYears);
      modal.classList.remove('active');
      this.renderAll();
    });
    optionsBox.appendChild(pubBtn);

    modal.classList.add('active');
  }

  resolvePublicDefender(sentenceYears) {
    if (Math.random() < 0.20) {
      this.character.inPrison = false;
      this.character.prisonYearsLeft = 0;
      sound.playFanfare();
      alert('⚖️ Miraculous! The judge threw out the case due to lack of witnesses.');
    } else {
      sound.playPrisonDoor();
      alert(`⚖️ Convicted! You were sentenced to ${sentenceYears} years in maximum security.`);
    }
  }

  startPrisonBreak() {
    this.inPrisonBreak = true;
    const modal = document.getElementById('prisonBreakModal');
    modal.classList.add('active');

    this.prisonGameState = {
      player: { x: 1, y: 1 },
      exit: { x: 10, y: 6 },
      guards: [
        { x: 4, y: 2, dir: 1, minX: 2, maxX: 7 },
        { x: 8, y: 4, dir: -1, minX: 4, maxX: 9 },
        { x: 3, y: 6, dir: 1, minX: 2, maxX: 8 }
      ],
      walls: [
        { x: 0, y: 0, w: 12, h: 1 },
        { x: 0, y: 7, w: 12, h: 1 },
        { x: 0, y: 0, w: 1, h: 8 },
        { x: 11, y: 0, w: 1, h: 8 },
        { x: 5, y: 3, w: 2, h: 2 }
      ]
    };

    this.renderPrisonCanvas();
  }

  movePrisonPlayer(dx, dy) {
    if (!this.inPrisonBreak) return;
    const state = this.prisonGameState;
    const nx = state.player.x + dx;
    const ny = state.player.y + dy;

    if (nx < 1 || nx > 10 || ny < 1 || ny > 6) return;
    if (nx >= 5 && nx <= 6 && ny >= 3 && ny <= 4) return;

    state.player.x = nx;
    state.player.y = ny;

    state.guards.forEach(g => {
      g.x += g.dir;
      if (g.x >= g.maxX || g.x <= g.minX) {
        g.dir *= -1;
      }
    });

    for (const g of state.guards) {
      const dist = Math.hypot(g.x - state.player.x, g.y - state.player.y);
      if (dist < 1.4) {
        sound.playSiren();
        alert('🚨 SPOTLIGHT CAUGHT YOU! Prison guards tackled you. 5 years added to your sentence!');
        this.character.prisonYearsLeft += 5;
        this.endPrisonBreak(false);
        return;
      }
    }

    if (state.player.x === state.exit.x && state.player.y === state.exit.y) {
      sound.playFanfare();
      alert('🏃 YOU ESCAPED! You slipped through the ventilation duct into the free world!');
      this.character.inPrison = false;
      this.character.prisonYearsLeft = 0;
      this.endPrisonBreak(true);
      return;
    }

    this.renderPrisonCanvas();
  }

  endPrisonBreak(success) {
    this.inPrisonBreak = false;
    document.getElementById('prisonBreakModal').classList.remove('active');
    this.renderAll();
  }

  renderPrisonCanvas() {
    const canvas = document.getElementById('prisonCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tileSize = 32;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    ctx.fillStyle = '#334155';
    this.prisonGameState.walls.forEach(w => {
      ctx.fillRect(w.x * tileSize, w.y * tileSize, w.w * tileSize, w.h * tileSize);
    });

    ctx.font = '22px sans-serif';
    ctx.fillText('🚪', this.prisonGameState.exit.x * tileSize + 4, (this.prisonGameState.exit.y + 1) * tileSize - 6);

    this.prisonGameState.guards.forEach(g => {
      ctx.beginPath();
      ctx.arc((g.x + 0.5) * tileSize, (g.y + 0.5) * tileSize, tileSize * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fill();

      ctx.fillText('👮', g.x * tileSize + 4, (g.y + 1) * tileSize - 6);
    });

    ctx.fillText('🏃', this.prisonGameState.player.x * tileSize + 4, (this.prisonGameState.player.y + 1) * tileSize - 6);
  }

  visitDoctor() {
    sound.playClick();
    if (this.character.cash < 400) {
      alert('❌ Doctor consultation costs $400.');
      return;
    }
    this.character.cash -= 400;
    this.character.health = this.clamp(this.character.health + this.randInt(8, 16));
    this.character.happiness = this.clamp(this.character.happiness + 5);
    alert('🩺 The physician treated your symptoms, administered vitamin infusions, and boosted your health!');
    this.renderAll();
  }

  goToGym() {
    sound.playClick();
    this.character.health = this.clamp(this.character.health + this.randInt(3, 7));
    this.character.looks = this.clamp(this.character.looks + this.randInt(2, 5));
    this.character.happiness = this.clamp(this.character.happiness + 4);
    alert('💪 You crushed a workout at the gym. Looking toned and feeling energized!');
    this.renderAll();
  }

  meditate() {
    sound.playClick();
    this.character.happiness = this.clamp(this.character.happiness + this.randInt(6, 12));
    alert('🧘 You practiced mindfulness meditation. Your mental clarity is restored.');
    this.renderAll();
  }

  plasticSurgery() {
    if (this.character.cash < 8000) {
      alert('❌ Cosmetic plastic surgery costs $8,000.');
      return;
    }
    this.character.cash -= 8000;
    if (Math.random() < 0.85) {
      sound.playFanfare();
      this.character.looks = this.clamp(this.character.looks + this.randInt(15, 30));
      alert('✨ Flawless procedure! Your facial symmetry and aesthetic appeal increased dramatically.');
    } else {
      this.character.looks = this.clamp(this.character.looks - 15);
      this.character.happiness = this.clamp(this.character.happiness - 20);
      alert('⚠️ Botched surgery! The swelling took months to heal, leaving uneven results.');
    }
    this.renderAll();
  }

  killCharacter(cause) {
    this.character.isAlive = false;
    sound.playDeath();

    const netWorth = this.calculateNetWorth();
    const ribbon = this.awardRibbon(netWorth);

    const modal = document.getElementById('deathModal');
    document.getElementById('deathAge').textContent = `${this.character.age} Years Old`;
    document.getElementById('deathCause').textContent = cause;
    document.getElementById('deathNetWorth').textContent = this.formatMoney(netWorth);
    document.getElementById('ribbonIcon').textContent = ribbon.icon;
    document.getElementById('ribbonName').textContent = ribbon.title;
    document.getElementById('ribbonDesc').textContent = ribbon.desc;

    const heirSelect = document.getElementById('heirSelect');
    heirSelect.innerHTML = '';
    if (this.character.children.length > 0) {
      this.character.children.forEach((c, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${c.name} (${c.age} yrs old, ${c.gender === 'M' ? 'Son' : 'Daughter'})`;
        heirSelect.appendChild(opt);
      });
      document.getElementById('dynastyOptionBox').style.display = 'block';
    } else {
      document.getElementById('dynastyOptionBox').style.display = 'none';
    }

    modal.classList.add('active');
  }

  calculateNetWorth() {
    let total = this.character.cash;
    this.character.realEstate.forEach(p => total += p.price);
    this.character.vehicles.forEach(v => total += v.price);
    for (const [stockId, shares] of Object.entries(this.character.portfolio)) {
      const stock = STOCKS.find(s => s.id === stockId);
      if (stock && shares > 0) total += Math.round(stock.price * shares);
    }
    return total;
  }

  awardRibbon(netWorth) {
    if (netWorth >= 10000000) return RIBBONS.find(r => r.id === 'loaded');
    if (this.character.fame >= 80) return RIBBONS.find(r => r.id === 'superstar');
    if (this.character.stats.yearsInPrison >= 20) return RIBBONS.find(r => r.id === 'jailbird');
    if (this.character.stats.crimesCommitted >= 8 || (this.character.job && this.character.job.isCrime)) return RIBBONS.find(r => r.id === 'wicked');
    if (this.character.age >= 100) return RIBBONS.find(r => r.id === 'centenarian');
    if (this.character.degrees.length >= 2 && this.character.smarts >= 80) return RIBBONS.find(r => r.id === 'academic');
    if (this.character.stats.loversCount >= 5) return RIBBONS.find(r => r.id === 'scandalous');
    if (this.character.karma >= 80) return RIBBONS.find(r => r.id === 'hero');
    if (this.character.children.length >= 3) return RIBBONS.find(r => r.id === 'family_first');
    return RIBBONS.find(r => r.id === 'mediocre');
  }

  continueAsHeir() {
    const heirSelect = document.getElementById('heirSelect');
    const childIndex = parseInt(heirSelect.value);
    const child = this.character.children[childIndex];
    if (!child) return;

    document.getElementById('deathModal').classList.remove('active');

    const heirData = {
      name: child.name,
      gender: child.gender,
      age: Math.max(18, child.age),
      cash: Math.max(0, this.character.cash),
      realEstate: [...this.character.realEstate],
      country: this.character.country,
      city: this.character.city
    };

    this.startNewLife(heirData);
  }

  initDOM() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sound.playClick();
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    const ageBtn = document.getElementById('btnAgeUp');
    if (ageBtn) {
      ageBtn.addEventListener('click', () => this.ageUp());
    }

    const soundBtn = document.getElementById('soundToggleBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const muted = sound.toggleMute();
        soundBtn.textContent = muted ? '🔇' : '🔊';
      });
    }

    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.closest('.modal-backdrop').classList.remove('active');
      });
    });

    const btnNewLife = document.getElementById('btnNewLife');
    if (btnNewLife) {
      btnNewLife.addEventListener('click', () => {
        document.getElementById('deathModal').classList.remove('active');
        this.startNewLife();
      });
    }

    const btnDynasty = document.getElementById('btnContinueDynasty');
    if (btnDynasty) {
      btnDynasty.addEventListener('click', () => this.continueAsHeir());
    }

    window.addEventListener('keydown', (e) => {
      if (!this.inPrisonBreak) return;
      if (e.key === 'ArrowUp' || e.key === 'w') this.movePrisonPlayer(0, -1);
      if (e.key === 'ArrowDown' || e.key === 's') this.movePrisonPlayer(0, 1);
      if (e.key === 'ArrowLeft' || e.key === 'a') this.movePrisonPlayer(-1, 0);
      if (e.key === 'ArrowRight' || e.key === 'd') this.movePrisonPlayer(1, 0);
    });

    const dpadUp = document.getElementById('dpadUp');
    const dpadDown = document.getElementById('dpadDown');
    const dpadLeft = document.getElementById('dpadLeft');
    const dpadRight = document.getElementById('dpadRight');
    if (dpadUp) dpadUp.addEventListener('click', () => this.movePrisonPlayer(0, -1));
    if (dpadDown) dpadDown.addEventListener('click', () => this.movePrisonPlayer(0, 1));
    if (dpadLeft) dpadLeft.addEventListener('click', () => this.movePrisonPlayer(-1, 0));
    if (dpadRight) dpadRight.addEventListener('click', () => this.movePrisonPlayer(1, 0));
  }

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active'));
    const target = document.getElementById(`tab-${tab}`);
    if (target) target.classList.add('active');
    this.renderTabContent(tab);
  }

  renderAll() {
    this.renderHeader();
    this.renderVitals();
    this.renderTabContent(this.activeTab);
  }

  renderHeader() {
    document.getElementById('charAvatar').textContent = this.getAvatar();
    document.getElementById('charName').textContent = this.character.name;
    document.getElementById('charAge').textContent = `Age ${this.character.age}`;
    document.getElementById('charBank').textContent = this.formatMoney(this.character.cash);

    const careerText = this.character.job ? this.character.job.title : (this.character.age < 18 ? this.character.education : 'Unemployed');
    document.getElementById('charCareerText').textContent = careerText;
    document.getElementById('charLocation').textContent = `${this.character.city}, ${this.character.country.name}`;
    document.getElementById('dynastyBadge').textContent = `Gen ${this.generation}`;
  }

  renderVitals() {
    const { happiness, health, smarts, looks } = this.character;

    document.getElementById('valHappiness').textContent = `${happiness}%`;
    document.getElementById('barHappiness').style.width = `${happiness}%`;

    document.getElementById('valHealth').textContent = `${health}%`;
    document.getElementById('barHealth').style.width = `${health}%`;

    document.getElementById('valSmarts').textContent = `${smarts}%`;
    document.getElementById('barSmarts').style.width = `${smarts}%`;

    document.getElementById('valLooks').textContent = `${looks}%`;
    document.getElementById('barLooks').style.width = `${looks}%`;
  }

  renderTabContent(tab) {
    if (tab === 'log') this.renderLogTab();
    if (tab === 'career') this.renderCareerTab();
    if (tab === 'relationships') this.renderRelationshipsTab();
    if (tab === 'assets') this.renderAssetsTab();
    if (tab === 'activities') this.renderActivitiesTab();
  }

  renderLogTab() {
    const feed = document.getElementById('lifeFeed');
    feed.innerHTML = '';

    this.history.forEach((yearBlock, idx) => {
      const card = document.createElement('div');
      card.className = `year-block ${idx === 0 ? 'current' : ''}`;

      const header = document.createElement('div');
      header.className = 'year-header';
      header.textContent = `Age ${yearBlock.year}`;
      card.appendChild(header);

      yearBlock.events.forEach(text => {
        const p = document.createElement('div');
        p.className = 'event-bullet';
        p.innerHTML = `<span class="event-icon">•</span> <span>${text}</span>`;
        card.appendChild(p);
      });

      feed.appendChild(card);
    });
  }

  renderCareerTab() {
    const container = document.getElementById('careerContent');
    container.innerHTML = '';

    if (this.character.inPrison) {
      container.innerHTML = `
        <div class="action-card" style="border-color: #ef4444;">
          <div class="action-icon">⛓️</div>
          <div class="action-details">
            <div class="action-name" style="color: #ef4444;">Incarcerated in Maximum Security</div>
            <div class="action-desc">Remaining Sentence: ${this.character.prisonYearsLeft} years</div>
          </div>
        </div>
      `;
      return;
    }

    const eduHeader = document.createElement('div');
    eduHeader.className = 'section-title';
    eduHeader.innerHTML = '🎓 Education & Degrees';
    container.appendChild(eduHeader);

    const eduCard = document.createElement('div');
    eduCard.className = 'action-card';
    eduCard.innerHTML = `
      <div class="action-icon">🏫</div>
      <div class="action-details">
        <div class="action-name">${this.character.education}</div>
        <div class="action-desc">${this.character.degrees.length > 0 ? 'Degrees: ' + this.character.degrees.join(', ') : 'No higher degrees earned yet.'}</div>
      </div>
    `;
    container.appendChild(eduCard);

    if (this.character.age >= 6 && this.character.age < 18) {
      const studyBtn = document.createElement('div');
      studyBtn.className = 'action-card';
      studyBtn.innerHTML = `
        <div class="action-icon">📖</div>
        <div class="action-details">
          <div class="action-name">Study Harder</div>
          <div class="action-desc">Increase your school grades & boost Smarts stat</div>
        </div>
      `;
      studyBtn.addEventListener('click', () => this.studyHarder());
      container.appendChild(studyBtn);
    }

    if (this.character.age >= 18) {
      const uniHeader = document.createElement('div');
      uniHeader.className = 'section-title';
      uniHeader.innerHTML = '🏛️ University Degrees';
      container.appendChild(uniHeader);

      DEGREES.forEach(deg => {
        const dCard = document.createElement('div');
        dCard.className = 'action-card';
        const hasIt = this.character.degrees.includes(deg.id);
        dCard.innerHTML = `
          <div class="action-icon">${hasIt ? '✅' : '📜'}</div>
          <div class="action-details">
            <div class="action-name">${deg.name}</div>
            <div class="action-desc">Tuition: ${this.formatMoney(deg.tuition)} | Req Smarts: ${deg.smartsReq}%</div>
          </div>
        `;
        if (!hasIt) {
          dCard.addEventListener('click', () => this.enrollDegree(deg.id));
        }
        container.appendChild(dCard);
      });

      const gradHeader = document.createElement('div');
      gradHeader.className = 'section-title';
      gradHeader.innerHTML = '🩺 Graduate Schools';
      container.appendChild(gradHeader);

      GRAD_SCHOOLS.forEach(grad => {
        const gCard = document.createElement('div');
        gCard.className = 'action-card';
        const hasIt = this.character.degrees.includes(grad.id);
        gCard.innerHTML = `
          <div class="action-icon">${hasIt ? '✅' : '🎓'}</div>
          <div class="action-details">
            <div class="action-name">${grad.name}</div>
            <div class="action-desc">Tuition: ${this.formatMoney(grad.tuition)} | Req Smarts: ${grad.smartsReq}%</div>
          </div>
        `;
        if (!hasIt) {
          gCard.addEventListener('click', () => this.enrollGradSchool(grad.id));
        }
        container.appendChild(gCard);
      });
    }

    const jobHeader = document.createElement('div');
    jobHeader.className = 'section-title';
    jobHeader.innerHTML = '💼 Current Occupation';
    container.appendChild(jobHeader);

    if (this.character.job) {
      const jCard = document.createElement('div');
      jCard.className = 'action-card';
      jCard.innerHTML = `
        <div class="action-icon">🏢</div>
        <div class="action-details">
          <div class="action-name">${this.character.job.title} (${this.character.job.category})</div>
          <div class="action-desc">Salary: ${this.formatMoney(this.character.job.baseSalary)}/yr | Performance: ${this.character.jobPerformance}%</div>
        </div>
      `;
      container.appendChild(jCard);

      const jobActions = [
        { name: 'Work Harder', desc: 'Boost performance & impress executive management', fn: () => this.workHarder() },
        { name: 'Ask for a Raise', desc: 'Negotiate a 12% salary raise based on performance', fn: () => this.askForRaise() },
        { name: 'Ask for a Promotion', desc: 'Climb to the next tier on your career ladder', fn: () => this.askForPromotion() },
        { name: 'Resign Position', desc: 'Leave this job immediately', fn: () => this.resignJob() }
      ];

      jobActions.forEach(act => {
        const btn = document.createElement('div');
        btn.className = 'action-card';
        btn.innerHTML = `
          <div class="action-icon">⚡</div>
          <div class="action-details">
            <div class="action-name">${act.name}</div>
            <div class="action-desc">${act.desc}</div>
          </div>
        `;
        btn.addEventListener('click', act.fn);
        container.appendChild(btn);
      });
    } else {
      const noJob = document.createElement('div');
      noJob.className = 'action-card';
      noJob.innerHTML = `
        <div class="action-icon">💤</div>
        <div class="action-details">
          <div class="action-name">Unemployed</div>
          <div class="action-desc">Browse open positions below to apply for work.</div>
        </div>
      `;
      container.appendChild(noJob);
    }

    const marketHeader = document.createElement('div');
    marketHeader.className = 'section-title';
    marketHeader.innerHTML = '📰 Job Market Listings';
    container.appendChild(marketHeader);

    CAREERS.forEach(c => {
      const cCard = document.createElement('div');
      cCard.className = 'action-card';
      cCard.innerHTML = `
        <div class="action-icon">${c.isFame ? '🌟' : (c.isCrime ? '🔫' : '💼')}</div>
        <div class="action-details">
          <div class="action-name">${c.title}</div>
          <div class="action-desc">Salary: ${this.formatMoney(c.baseSalary)} | Category: ${c.category}</div>
        </div>
      `;
      cCard.addEventListener('click', () => this.applyJob(c.id));
      container.appendChild(cCard);
    });
  }

  renderRelationshipsTab() {
    const container = document.getElementById('relationshipContent');
    container.innerHTML = '';

    const loveHeader = document.createElement('div');
    loveHeader.className = 'section-title';
    loveHeader.innerHTML = '❤️ Romantic Partner';
    container.appendChild(loveHeader);

    if (this.character.partner) {
      const p = this.character.partner;
      const pCard = document.createElement('div');
      pCard.className = 'action-card';
      pCard.innerHTML = `
        <div class="action-icon">${p.isMarried ? '💍' : '💘'}</div>
        <div class="action-details">
          <div class="action-name">${p.name} (${p.isMarried ? 'Spouse' : 'Partner'}, Age ${p.age})</div>
          <div class="action-desc">${p.job} | Relationship: ${p.relationship}%</div>
        </div>
      `;
      container.appendChild(pCard);

      const pActions = [
        { name: 'Spend Time Together', desc: 'Go out for coffee or a romantic walk', fn: () => this.interactPerson(p, 'spend_time') },
        { name: 'Have a Baby', desc: 'Try for a newborn child', fn: () => this.haveBaby() },
        { name: p.isMarried ? 'Already Married' : 'Propose Marriage ($5,000)', desc: 'Buy an engagement ring & tie the knot', fn: () => this.proposeMarriage() },
        { name: p.isMarried ? 'File for Divorce' : 'Break Up', desc: 'End this relationship', fn: () => this.divorcePartner() }
      ];

      pActions.forEach(act => {
        const btn = document.createElement('div');
        btn.className = 'action-card';
        btn.innerHTML = `
          <div class="action-icon">✨</div>
          <div class="action-details">
            <div class="action-name">${act.name}</div>
            <div class="action-desc">${act.desc}</div>
          </div>
        `;
        btn.addEventListener('click', act.fn);
        container.appendChild(btn);
      });
    } else {
      const findBtn = document.createElement('div');
      findBtn.className = 'action-card';
      findBtn.innerHTML = `
        <div class="action-icon">📱</div>
        <div class="action-details">
          <div class="action-name">Open Dating App / Meet Singles</div>
          <div class="action-desc">Browse local singles and find a romantic spark</div>
        </div>
      `;
      findBtn.addEventListener('click', () => this.findDate());
      container.appendChild(findBtn);
    }

    if (this.character.children.length > 0) {
      const childHeader = document.createElement('div');
      childHeader.className = 'section-title';
      childHeader.innerHTML = '👶 Children';
      container.appendChild(childHeader);

      this.character.children.forEach(c => {
        const cCard = document.createElement('div');
        cCard.className = 'action-card';
        cCard.innerHTML = `
          <div class="action-icon">${c.gender === 'M' ? '👦' : '👧'}</div>
          <div class="action-details">
            <div class="action-name">${c.name} (Age ${c.age})</div>
            <div class="action-desc">Relationship: ${c.relationship}%</div>
          </div>
        `;
        cCard.addEventListener('click', () => this.interactPerson(c, 'spend_time'));
        container.appendChild(cCard);
      });
    }

    const parentHeader = document.createElement('div');
    parentHeader.className = 'section-title';
    parentHeader.innerHTML = '👨‍👩‍👧 Parents';
    container.appendChild(parentHeader);

    this.character.parents.forEach(p => {
      const card = document.createElement('div');
      card.className = 'action-card';
      card.innerHTML = `
        <div class="action-icon">${p.relation === 'Father' ? '👨' : '👩'}</div>
        <div class="action-details">
          <div class="action-name">${p.name} (${p.relation}, Age ${p.age})</div>
          <div class="action-desc">${p.job} | Relationship: ${p.relationship}%</div>
        </div>
      `;
      card.addEventListener('click', () => this.showPersonActionsModal(p));
      container.appendChild(card);
    });

    if (this.character.siblings.length > 0) {
      const sibHeader = document.createElement('div');
      sibHeader.className = 'section-title';
      sibHeader.innerHTML = '👫 Siblings';
      container.appendChild(sibHeader);

      this.character.siblings.forEach(s => {
        const card = document.createElement('div');
        card.className = 'action-card';
        card.innerHTML = `
          <div class="action-icon">${s.relation === 'Brother' ? '👦' : '👧'}</div>
          <div class="action-details">
            <div class="action-name">${s.name} (${s.relation}, Age ${s.age})</div>
            <div class="action-desc">Relationship: ${s.relationship}%</div>
          </div>
        `;
        card.addEventListener('click', () => this.showPersonActionsModal(s));
        container.appendChild(card);
      });
    }
  }

  showPersonActionsModal(person) {
    const modal = document.getElementById('decisionModal');
    const title = document.getElementById('modalTitle');
    const desc = document.getElementById('modalDesc');
    const optionsBox = document.getElementById('modalOptions');

    title.textContent = person.name;
    desc.textContent = `${person.relation} • Age ${person.age} • Relationship: ${person.relationship}%`;
    optionsBox.innerHTML = '';

    const actions = [
      { text: '☕ Spend Quality Time', type: 'spend_time' },
      { text: '💬 Give a Heartfelt Compliment', type: 'compliment' },
      { text: '🎁 Buy a Luxury Gift ($250)', type: 'gift' },
      { text: '💵 Ask for Money', type: 'ask_money' }
    ];

    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.className = 'btn-option';
      btn.textContent = a.text;
      btn.addEventListener('click', () => {
        modal.classList.remove('active');
        this.interactPerson(person, a.type);
      });
      optionsBox.appendChild(btn);
    });

    modal.classList.add('active');
  }

  renderAssetsTab() {
    const container = document.getElementById('assetContent');
    container.innerHTML = '';

    const netWorth = this.calculateNetWorth();
    const sumCard = document.createElement('div');
    sumCard.className = 'action-card';
    sumCard.innerHTML = `
      <div class="action-icon">💎</div>
      <div class="action-details">
        <div class="action-name">Total Net Worth</div>
        <div class="action-desc">Cash + Real Estate + Vehicles + Stocks</div>
      </div>
      <div class="action-extra">${this.formatMoney(netWorth)}</div>
    `;
    container.appendChild(sumCard);

    const reHeader = document.createElement('div');
    reHeader.className = 'section-title';
    reHeader.innerHTML = '🏡 Owned Real Estate';
    container.appendChild(reHeader);

    if (this.character.realEstate.length === 0) {
      const noRe = document.createElement('div');
      noRe.className = 'action-card';
      noRe.innerHTML = `
        <div class="action-icon">📦</div>
        <div class="action-details">
          <div class="action-name">No Properties Owned</div>
          <div class="action-desc">Browse real estate listings below to buy.</div>
        </div>
      `;
      container.appendChild(noRe);
    } else {
      this.character.realEstate.forEach((prop, idx) => {
        const pCard = document.createElement('div');
        pCard.className = 'action-card';
        pCard.innerHTML = `
          <div class="action-icon">🏠</div>
          <div class="action-details">
            <div class="action-name">${prop.name}</div>
            <div class="action-desc">Condition: ${prop.condition}% | Rent: ${this.formatMoney(prop.monthlyRent * 12)}/yr</div>
          </div>
        `;
        pCard.addEventListener('click', () => {
          if (confirm(`Manage ${prop.name}:\nClick OK to Renovate (${this.formatMoney(Math.round(prop.price * 0.05))}) or Cancel to Sell.`)) {
            this.renovateProperty(idx);
          } else {
            if (confirm(`Sell ${prop.name} for ${this.formatMoney(Math.round(prop.price * (prop.condition / 100)))}?`)) {
              this.sellProperty(idx);
            }
          }
        });
        container.appendChild(pCard);
      });
    }

    const listHeader = document.createElement('div');
    listHeader.className = 'section-title';
    listHeader.innerHTML = '🏘️ Real Estate Market Listings';
    container.appendChild(listHeader);

    REAL_ESTATE.forEach(prop => {
      const card = document.createElement('div');
      card.className = 'action-card';
      card.innerHTML = `
        <div class="action-icon">🔑</div>
        <div class="action-details">
          <div class="action-name">${prop.name}</div>
          <div class="action-desc">Price: ${this.formatMoney(prop.price)} | Est. Rent: ${this.formatMoney(prop.monthlyRent)}/mo</div>
        </div>
      `;
      card.addEventListener('click', () => this.buyProperty(prop.id));
      container.appendChild(card);
    });

    const vehHeader = document.createElement('div');
    vehHeader.className = 'section-title';
    vehHeader.innerHTML = '🏎️ Luxury Vehicles & Dealership';
    container.appendChild(vehHeader);

    VEHICLES.forEach(veh => {
      const vCard = document.createElement('div');
      vCard.className = 'action-card';
      vCard.innerHTML = `
        <div class="action-icon">🚗</div>
        <div class="action-details">
          <div class="action-name">${veh.name}</div>
          <div class="action-desc">Price: ${this.formatMoney(veh.price)} | Maint: ${this.formatMoney(veh.yearlyMaint)}/yr</div>
        </div>
      `;
      vCard.addEventListener('click', () => this.buyVehicle(veh.id));
      container.appendChild(vCard);
    });

    const stockHeader = document.createElement('div');
    stockHeader.className = 'section-title';
    stockHeader.innerHTML = '📊 Stocks & Crypto Exchange';
    container.appendChild(stockHeader);

    STOCKS.forEach(s => {
      const owned = this.character.portfolio[s.id] || 0;
      const sCard = document.createElement('div');
      sCard.className = 'action-card';
      sCard.innerHTML = `
        <div class="action-icon">📈</div>
        <div class="action-details">
          <div class="action-name">${s.ticker} (${s.name})</div>
          <div class="action-desc">Current Price: ${this.formatMoney(s.price)} | Owned: ${owned} shares</div>
        </div>
      `;
      sCard.addEventListener('click', () => {
        const action = prompt(`Trade ${s.ticker} (${this.formatMoney(s.price)}/share):\nEnter number of shares to BUY, or negative number to SELL (e.g. 10 or -10):`, '10');
        if (action !== null) {
          const count = parseInt(action);
          if (!isNaN(count) && count !== 0) {
            this.tradeStock(s.id, count);
          }
        }
      });
      container.appendChild(sCard);
    });
  }

  renderActivitiesTab() {
    const container = document.getElementById('activityContent');
    container.innerHTML = '';

    if (this.character.inPrison) {
      const prisonHeader = document.createElement('div');
      prisonHeader.className = 'section-title';
      prisonHeader.innerHTML = '⛓️ Maximum Security Prison Yard';
      container.appendChild(prisonHeader);

      const escapeCard = document.createElement('div');
      escapeCard.className = 'action-card';
      escapeCard.style.borderColor = '#ef4444';
      escapeCard.innerHTML = `
        <div class="action-icon">🚨</div>
        <div class="action-details">
          <div class="action-name" style="color: #ef4444;">Attempt Prison Break (Stealth Mini-Game)</div>
          <div class="action-desc">Sneak through prison patrol spotlights to the ventilation hatch</div>
        </div>
      `;
      escapeCard.addEventListener('click', () => this.startPrisonBreak());
      container.appendChild(escapeCard);
      return;
    }

    const healthHeader = document.createElement('div');
    healthHeader.className = 'section-title';
    healthHeader.innerHTML = '🧘 Mind & Body Wellness';
    container.appendChild(healthHeader);

    const wellnessActions = [
      { name: 'Visit Medical Doctor ($400)', desc: 'Full diagnostic checkup & prescription booster', fn: () => this.visitDoctor() },
      { name: 'Hit the Fitness Gym', desc: 'Workout to build physical resilience & Looks', fn: () => this.goToGym() },
      { name: 'Mindfulness Meditation', desc: 'Clear anxiety and restore mental Happiness', fn: () => this.meditate() },
      { name: 'Plastic & Cosmetic Surgery ($8,000)', desc: 'High-risk surgery to substantially enhance Looks', fn: () => this.plasticSurgery() }
    ];

    wellnessActions.forEach(act => {
      const card = document.createElement('div');
      card.className = 'action-card';
      card.innerHTML = `
        <div class="action-icon">✨</div>
        <div class="action-details">
          <div class="action-name">${act.name}</div>
          <div class="action-desc">${act.desc}</div>
        </div>
      `;
      card.addEventListener('click', act.fn);
      container.appendChild(card);
    });

    const crimeHeader = document.createElement('div');
    crimeHeader.className = 'section-title';
    crimeHeader.innerHTML = '🔫 Crime & The Underworld';
    container.appendChild(crimeHeader);

    const crimeActions = [
      { name: 'Pickpocketing & Petty Theft', desc: 'Quick cash from unsuspecting pedestrians (Moderate arrest risk)', fn: () => this.commitPettyCrime() },
      { name: 'Commercial Bank Heist', desc: 'High-stakes bank robbery for $150,000 - $650,000 loot (High arrest risk)', fn: () => this.commitBankHeist() }
    ];

    crimeActions.forEach(act => {
      const card = document.createElement('div');
      card.className = 'action-card';
      card.innerHTML = `
        <div class="action-icon">⚠️</div>
        <div class="action-details">
          <div class="action-name">${act.name}</div>
          <div class="action-desc">${act.desc}</div>
        </div>
      `;
      card.addEventListener('click', act.fn);
      container.appendChild(card);
    });

    const luckHeader = document.createElement('div');
    luckHeader.className = 'section-title';
    luckHeader.innerHTML = '🎰 Casino & Lottery';
    container.appendChild(luckHeader);

    const lottoCard = document.createElement('div');
    lottoCard.className = 'action-card';
    lottoCard.innerHTML = `
      <div class="action-icon">🎟️</div>
      <div class="action-details">
        <div class="action-name">Buy National Powerball Ticket ($20)</div>
        <div class="action-desc">Chance to win the $50,000,000 multi-generational jackpot!</div>
      </div>
    `;
    lottoCard.addEventListener('click', () => {
      if (this.character.cash < 20) {
        alert('❌ You need $20 for a lottery ticket.');
        return;
      }
      this.character.cash -= 20;
      sound.playClick();
      if (Math.random() < 0.005) {
        sound.playFanfare();
        this.character.cash += 50000000;
        alert('🎉 JACKPOT WINNER! You matched all numbers and won $50,000,000!');
      } else {
        alert('❌ None of your numbers hit. Better luck next time!');
      }
      this.renderAll();
    });
    container.appendChild(lottoCard);

    const emigrateHeader = document.createElement('div');
    emigrateHeader.className = 'section-title';
    emigrateHeader.innerHTML = '✈️ Emigrate to a New Country';
    container.appendChild(emigrateHeader);

    COUNTRIES.forEach(c => {
      if (c.name !== this.character.country.name) {
        const eCard = document.createElement('div');
        eCard.className = 'action-card';
        eCard.innerHTML = `
          <div class="action-icon">🌍</div>
          <div class="action-details">
            <div class="action-name">Emigrate to ${c.name}</div>
            <div class="action-desc">Flight & visa fee: $3,500 | Currency: ${c.currency}</div>
          </div>
        `;
        eCard.addEventListener('click', () => {
          if (this.character.cash < 3500) {
            alert('❌ Emigration costs $3,500.');
            return;
          }
          if (confirm(`Move permanently to ${c.name}?`)) {
            sound.playFanfare();
            this.character.cash -= 3500;
            this.character.country = c;
            this.character.city = this.randChoice(c.cities);
            this.character.happiness = this.clamp(this.character.happiness + 15);
            alert(`✈️ Welcome to your new home in ${this.character.city}, ${c.name}!`);
            this.renderAll();
          }
        });
        container.appendChild(eCard);
      }
    });
  }
}

// Robust auto-initialization that works in any browser environment
function initLifeLines() {
  if (!window.gameEngine) {
    window.gameEngine = new LifeLinesEngine();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLifeLines);
} else {
  initLifeLines();
}
