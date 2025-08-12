export type PlayerStats = {
  name: string;
  kills: number;
  deaths: number;
  debuffs: number;
  damage: number;
  damageTaken: number;
  healing: number;
};

export type Match = {
  _id?: string;
  date: string;
  team1: string;
  team2: string;
  result: 'Victory' | 'Defeat';
  team1Score: number;
  team2Score: number;
  team1Players: PlayerStats[];
  team2Players: PlayerStats[];
};

export const matches: Match[] = [
  {
    _id: '1',
    date: '2024-04-15',
    team1: 'Manifest',
    team2: 'DragonesNegros',
    result: 'Victory',
    team1Score: 3,
    team2Score: 0,
    team1Players: [
      {
        name: 'Krazor',
        kills: 26,
        deaths: 0,
        debuffs: 9,
        damage: 169425,
        damageTaken: 0,
        healing: 24983
      },
      {
        name: 'FTP',
        kills: 20,
        deaths: 0,
        debuffs: 19,
        damage: 138298,
        damageTaken: 0,
        healing: 21508
      }
    ],
    team2Players: [
      {
        name: 'AKURASHI',
        kills: 0,
        deaths: 10,
        debuffs: 8,
        damage: 80478,
        damageTaken: 0,
        healing: 17288
      },
      {
        name: 'Mysticlan',
        kills: 0,
        deaths: 14,
        debuffs: 0,
        damage: 37,
        damageTaken: 0,
        healing: 999
      }
    ]
  },
  // Add more matches here
]; 