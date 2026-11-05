// lifelines/data.js - Comprehensive Game Database

export const COUNTRIES = [
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

export const FIRST_NAMES_MALE = [
  'Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Lucas', 'Benjamin', 'Theodore',
  'Mateo', 'Levi', 'Sebastian', 'Daniel', 'Jack', 'Alexander', 'Owen', 'Asher', 'Samuel', 'Ethan',
  'Kenji', 'Hiroshi', 'Ren', 'Leo', 'Arthur', 'Hugo', 'Gabriel', 'Matteo', 'Luca', 'Felix'
];

export const FIRST_NAMES_FEMALE = [
  'Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Evelyn', 'Luna',
  'Harper', 'Camila', 'Sofia', 'Aria', 'Chloe', 'Ella', 'Penelope', 'Layla', 'Nora', 'Hazel',
  'Sakura', 'Yuki', 'Aoi', 'Elena', 'Clara', 'Alice', 'Maya', 'Stella', 'Zoe', 'Freya'
];

export const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Tanaka', 'Sato', 'Suzuki', 'Takahashi', 'Watanabe', 'Müller', 'Schmidt', 'Schneider', 'Dubois', 'Laurent'
];

export const PARENT_OCCUPATIONS = [
  'Elementary Teacher', 'Architect', 'Software Engineer', 'Dentist', 'Police Officer',
  'Mechanic', 'Accountant', 'Electrician', 'Chef', 'Journalist',
  'Real Estate Agent', 'Veterinarian', 'Graphic Designer', 'Pharmacist', 'Store Manager'
];

export const DEGREES = [
  { id: 'cs', name: 'Computer Science', tuition: 24000, smartsReq: 50, duration: 4 },
  { id: 'business', name: 'Business Administration', tuition: 20000, smartsReq: 40, duration: 4 },
  { id: 'biology', name: 'Pre-Med / Biology', tuition: 28000, smartsReq: 65, duration: 4 },
  { id: 'law_prep', name: 'Political Science / Pre-Law', tuition: 22000, smartsReq: 55, duration: 4 },
  { id: 'arts', name: 'Fine Arts & Drama', tuition: 18000, smartsReq: 30, duration: 4 },
  { id: 'engineering', name: 'Mechanical Engineering', tuition: 26000, smartsReq: 60, duration: 4 }
];

export const GRAD_SCHOOLS = [
  { id: 'med_school', name: 'Medical School', tuition: 60000, smartsReq: 80, reqDegree: 'biology', duration: 4 },
  { id: 'law_school', name: 'Law School', tuition: 50000, smartsReq: 75, reqDegree: 'law_prep', duration: 3 },
  { id: 'business_school', name: 'MBA Program', tuition: 45000, smartsReq: 60, reqDegree: 'business', duration: 2 }
];

export const CAREERS = [
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

export const REAL_ESTATE = [
  { id: 'studio', name: 'Cozy Downtown Studio', price: 120000, monthlyRent: 850, baseCondition: 80 },
  { id: 'suburb_house', name: 'Suburban 3-Bedroom Home', price: 340000, monthlyRent: 2200, baseCondition: 85 },
  { id: 'luxury_condo', name: 'High-Rise Glass Penthouse', price: 850000, monthlyRent: 5500, baseCondition: 95 },
  { id: 'country_estate', name: 'Historic Country Manor', price: 1900000, monthlyRent: 11000, baseCondition: 70 },
  { id: 'oceanfront_villa', name: 'Mediterranean Oceanfront Villa', price: 4500000, monthlyRent: 26000, baseCondition: 90 },
  { id: 'private_island', name: 'Caribbean Private Island Retreat', price: 15000000, monthlyRent: 80000, baseCondition: 95 }
];

export const VEHICLES = [
  { id: 'used_sedan', name: 'Reliable Japanese Used Sedan', price: 6500, yearlyMaint: 400, speed: 40 },
  { id: 'electric_suv', name: 'Sleek Cyber Electric SUV', price: 48000, yearlyMaint: 900, speed: 70 },
  { id: 'sportscar', name: 'Italian Twin-Turbo V8 Sportscar', price: 165000, yearlyMaint: 4500, speed: 95 },
  { id: 'hypercar', name: 'Boutique Carbon Hypercar', price: 1200000, yearlyMaint: 25000, speed: 100 },
  { id: 'superyacht', name: '130-Foot Luxury Tri-Deck Superyacht', price: 8500000, yearlyMaint: 180000, speed: 50 },
  { id: 'private_jet', name: 'Twin-Engine Intercontinental Jet', price: 18000000, yearlyMaint: 450000, speed: 98 }
];

export const STOCKS = [
  { id: 'aegis', ticker: 'AEGIS', name: 'Aegis BioTech', price: 45.0, volatility: 0.15, dividend: 0.02 },
  { id: 'nova', ticker: 'NOVA', name: 'Nova Cloud & AI', price: 180.0, volatility: 0.25, dividend: 0.00 },
  { id: 'titan', ticker: 'TITAN', name: 'Titan Global Energy', price: 92.0, volatility: 0.09, dividend: 0.045 },
  { id: 'solaris', ticker: 'SOLAR', name: 'Solaris Electric Motors', price: 210.0, volatility: 0.30, dividend: 0.00 },
  { id: 'btc', ticker: 'CRYPTO-B', name: 'BitOnyx Token', price: 3400.0, volatility: 0.45, dividend: 0.00 },
  { id: 'eth', ticker: 'CRYPTO-E', name: 'EtherFlow Protocol', price: 240.0, volatility: 0.50, dividend: 0.00 }
];

export const PETS = [
  { type: 'Golden Retriever', cost: 1200, emoji: '🐕' },
  { type: 'Calico Cat', cost: 600, emoji: '🐈' },
  { type: 'African Grey Parrot', cost: 2000, emoji: '🦜' },
  { type: 'French Bulldog', cost: 2800, emoji: '🐶' }
];

export const AGE_EVENTS = {
  // Baby / Toddler
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

  // School Age
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

export const RANDOM_DILEMMAS = [
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

export const RIBBONS = [
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
