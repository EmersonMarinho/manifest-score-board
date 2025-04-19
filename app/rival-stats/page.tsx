"use client";

import React from 'react';
import Navbar from '../components/Navbar';
import { Match } from '../data/matches';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface RivalStats {
  totalMatches: number;
  victories: number;
  defeats: number;
  winRate: number;
  totalKills: number;
  totalDeaths: number;
  totalDamage: number;
  totalDebuffs: number;
  matchHistory: {
    date: string;
    result: string;
    kills: number;
    deaths: number;
    damage: number;
    debuffs: number;
    rivalKills: number;
    rivalDeaths: number;
    rivalDamage: number;
    rivalDebuffs: number;
    rivalGuild: string;
  }[];
  topPerformers: {
    manifest: {
      kills: { name: string; value: number; match: string; date: string };
      deaths: { name: string; value: number; match: string; date: string };
      damage: { name: string; value: number; match: string; date: string };
      debuffs: { name: string; value: number; match: string; date: string };
    };
    rivals: Record<string, {
      kills: { name: string; value: number; match: string; date: string };
      deaths: { name: string; value: number; match: string; date: string };
      damage: { name: string; value: number; match: string; date: string };
      debuffs: { name: string; value: number; match: string; date: string };
    }>;
  };
  playerStats: Map<string, {
    matches: number;
    kills: number;
    deaths: number;
    debuffs: number;
    damage: number;
    damageTaken: number;
    healing: number;
    victories: number;
    defeats: number;
  }>;
  rivalPlayerStats: Record<string, Map<string, {
    matches: number;
    kills: number;
    deaths: number;
    debuffs: number;
    damage: number;
    damageTaken: number;
    healing: number;
    victories: number;
    defeats: number;
  }>>;
}

export default function RivalStats() {
  const [selectedRival, setSelectedRival] = React.useState('Guilty');
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);
  const [manifestPlayerSearch, setManifestPlayerSearch] = React.useState('');
  const [rivalPlayerSearch, setRivalPlayerSearch] = React.useState('');
  const [compareMode, setCompareMode] = React.useState(false);
  const [selectedManifestPlayer, setSelectedManifestPlayer] = React.useState('');
  const [selectedRivalPlayer, setSelectedRivalPlayer] = React.useState('');

  React.useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      if (!response.ok) throw new Error('Failed to fetch matches');
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  // Calculate statistics against the selected rival
  const rivalStats = React.useMemo(() => {
    const stats: RivalStats = {
      totalMatches: 0,
      victories: 0,
      defeats: 0,
      winRate: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalDamage: 0,
      totalDebuffs: 0,
      matchHistory: [],
      topPerformers: {
        manifest: {
          kills: { name: '', value: 0, match: '', date: '' },
          deaths: { name: '', value: 0, match: '', date: '' },
          damage: { name: '', value: 0, match: '', date: '' },
          debuffs: { name: '', value: 0, match: '', date: '' }
        },
        rivals: {
          Guilty: {
            kills: { name: '', value: 0, match: '', date: '' },
            deaths: { name: '', value: 0, match: '', date: '' },
            damage: { name: '', value: 0, match: '', date: '' },
            debuffs: { name: '', value: 0, match: '', date: '' }
          },
          Allyance: {
            kills: { name: '', value: 0, match: '', date: '' },
            deaths: { name: '', value: 0, match: '', date: '' },
            damage: { name: '', value: 0, match: '', date: '' },
            debuffs: { name: '', value: 0, match: '', date: '' }
          }
        }
      },
      playerStats: new Map(),
      rivalPlayerStats: {
        Guilty: new Map(),
        Allyance: new Map()
      }
    };

    // Filter matches against any rival
    const rivalMatches = matches.filter(match => 
      (match.team1 === 'Manifest' && (match.team2 === selectedRival)) ||
      (match.team2 === 'Manifest' && (match.team1 === selectedRival))
    );

    stats.totalMatches = rivalMatches.length;
    stats.victories = rivalMatches.filter(m => 
      (m.team1 === 'Manifest' && m.result === 'Victory') ||
      (m.team2 === 'Manifest' && m.result === 'Defeat')
    ).length;
    stats.defeats = stats.totalMatches - stats.victories;
    stats.winRate = stats.totalMatches > 0 ? Math.round((stats.victories / stats.totalMatches) * 100) : 0;

    // Process match history and statistics
    rivalMatches.forEach(match => {
      const manifestPlayers = match.team1 === 'Manifest' ? match.team1Players : match.team2Players;
      const rivalPlayers = match.team1 === selectedRival ? match.team1Players : match.team2Players;
      const rivalGuild = match.team1 === 'Manifest' ? match.team2 : match.team1;
      const isVictory = (match.team1 === 'Manifest' && match.result === 'Victory') ||
                       (match.team2 === 'Manifest' && match.result === 'Defeat');

      let matchKills = 0;
      let matchDeaths = 0;
      let matchDamage = 0;
      let matchDebuffs = 0;
      let rivalKills = 0;
      let rivalDeaths = 0;
      let rivalDamage = 0;
      let rivalDebuffs = 0;

      // Process Manifest players
      manifestPlayers.forEach(player => {
        matchKills += player.kills;
        matchDeaths += player.deaths;
        matchDamage += player.damage;
        matchDebuffs += player.debuffs;

        const currentStats = stats.playerStats.get(player.name) || {
          matches: 0,
          kills: 0,
          deaths: 0,
          debuffs: 0,
          damage: 0,
          damageTaken: 0,
          healing: 0,
          victories: 0,
          defeats: 0
        };

        currentStats.matches += 1;
        currentStats.kills += player.kills;
        currentStats.deaths += player.deaths;
        currentStats.debuffs += player.debuffs;
        currentStats.damage += player.damage;
        currentStats.damageTaken += player.damageTaken;
        currentStats.healing += player.healing;
        if (isVictory) currentStats.victories += 1;
        else currentStats.defeats += 1;

        stats.playerStats.set(player.name, currentStats);

        // Update Manifest top performers
        if (player.kills > stats.topPerformers.manifest.kills.value) {
          stats.topPerformers.manifest.kills = {
            name: player.name,
            value: player.kills,
            match: `${match.team1} vs ${match.team2}`,
            date: match.date
          };
        }
        if (player.deaths > stats.topPerformers.manifest.deaths.value) {
          stats.topPerformers.manifest.deaths = {
            name: player.name,
            value: player.deaths,
            match: `${match.team1} vs ${match.team2}`,
            date: match.date
          };
        }
        if (player.damage > stats.topPerformers.manifest.damage.value) {
          stats.topPerformers.manifest.damage = {
            name: player.name,
            value: player.damage,
            match: `${match.team1} vs ${match.team2}`,
            date: match.date
          };
        }
        if (player.debuffs > stats.topPerformers.manifest.debuffs.value) {
          stats.topPerformers.manifest.debuffs = {
            name: player.name,
            value: player.debuffs,
            match: `${match.team1} vs ${match.team2}`,
            date: match.date
          };
        }
      });

      // Process rival players
      rivalPlayers.forEach(player => {
        rivalKills += player.kills;
        rivalDeaths += player.deaths;
        rivalDamage += player.damage;
        rivalDebuffs += player.debuffs;

        const currentStats = stats.rivalPlayerStats[rivalGuild].get(player.name) || {
          matches: 0,
          kills: 0,
          deaths: 0,
          debuffs: 0,
          damage: 0,
          damageTaken: 0,
          healing: 0,
          victories: 0,
          defeats: 0
        };

        currentStats.matches += 1;
        currentStats.kills += player.kills;
        currentStats.deaths += player.deaths;
        currentStats.debuffs += player.debuffs;
        currentStats.damage += player.damage;
        currentStats.damageTaken += player.damageTaken;
        currentStats.healing += player.healing;
        if (!isVictory) currentStats.victories += 1;
        else currentStats.defeats += 1;

        stats.rivalPlayerStats[rivalGuild].set(player.name, currentStats);

        // Update rival top performers
        if (player.kills > stats.topPerformers.rivals[rivalGuild].kills.value) {
          stats.topPerformers.rivals[rivalGuild].kills = {
            name: player.name,
            value: player.kills,
            match: `${match.team1} vs ${match.team2}`,
            date: match.date
          };
        }
        if (player.deaths > stats.topPerformers.rivals[rivalGuild].deaths.value) {
          stats.topPerformers.rivals[rivalGuild].deaths = {
            name: player.name,
            value: player.deaths,
            match: `${match.team1} vs ${match.team2}`,
            date: match.date
          };
        }
        if (player.damage > stats.topPerformers.rivals[rivalGuild].damage.value) {
          stats.topPerformers.rivals[rivalGuild].damage = {
            name: player.name,
            value: player.damage,
            match: `${match.team1} vs ${match.team2}`,
            date: match.date
          };
        }
        if (player.debuffs > stats.topPerformers.rivals[rivalGuild].debuffs.value) {
          stats.topPerformers.rivals[rivalGuild].debuffs = {
            name: player.name,
            value: player.debuffs,
            match: `${match.team1} vs ${match.team2}`,
            date: match.date
          };
        }
      });

      stats.totalKills += matchKills;
      stats.totalDeaths += matchDeaths;
      stats.totalDamage += matchDamage;
      stats.totalDebuffs += matchDebuffs;

      stats.matchHistory.push({
        date: match.date,
        result: isVictory ? 'Victory' : 'Defeat',
        kills: matchKills,
        deaths: matchDeaths,
        damage: matchDamage,
        debuffs: matchDebuffs,
        rivalKills,
        rivalDeaths,
        rivalDamage,
        rivalDebuffs,
        rivalGuild
      });
    });

    return stats;
  }, [matches, selectedRival]);

  // Filter players based on search terms
  const filteredManifestPlayers = React.useMemo(() => {
    const players = Array.from(rivalStats.playerStats.entries()).map(([name, stats]) => ({
      name,
      ...stats,
      kd: stats.deaths === 0 ? stats.kills : (stats.kills / stats.deaths).toFixed(2),
      winRate: ((stats.victories / stats.matches) * 100).toFixed(1)
    }));

    if (!manifestPlayerSearch) return players;

    return players.filter(player =>
      player.name.toLowerCase().includes(manifestPlayerSearch.toLowerCase())
    );
  }, [rivalStats, manifestPlayerSearch]);

  const filteredRivalPlayers = React.useMemo(() => {
    const players = Array.from(rivalStats.rivalPlayerStats[selectedRival].entries()).map(([name, stats]) => ({
      name,
      ...stats,
      kd: stats.deaths === 0 ? stats.kills : (stats.kills / stats.deaths).toFixed(2),
      winRate: ((stats.victories / stats.matches) * 100).toFixed(1)
    }));

    if (!rivalPlayerSearch) return players;

    return players.filter(player =>
      player.name.toLowerCase().includes(rivalPlayerSearch.toLowerCase())
    );
  }, [rivalStats, rivalPlayerSearch, selectedRival]);

  if (selectedMatch) {
    const sortedTeam1Players = [...selectedMatch.team1Players].sort((a, b) => b.kills - a.kills);
    const sortedTeam2Players = [...selectedMatch.team2Players].sort((a, b) => b.kills - a.kills);

    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-black text-white pt-16">
          <div className="container mx-auto px-4 py-8">
            <button
              onClick={() => setSelectedMatch(null)}
              className="flex items-center text-purple-500 hover:text-purple-400 mb-8"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              BACK TO RIVAL STATS
            </button>

            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">
                {selectedMatch.team1} vs {selectedMatch.team2}
              </h1>
              <div className="text-gray-400">{selectedMatch.date}</div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-purple-900 rounded-lg overflow-hidden">
                <div className="bg-purple-800 p-4">
                  <h2 className="text-xl font-bold text-green-400">
                    [Guild Defender] [{selectedMatch.result}] {selectedMatch.team1}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-800">
                      <tr>
                        <th className="text-left p-4">Player</th>
                        <th className="text-left p-4">K/D</th>
                        <th className="text-left p-4">Debuffs</th>
                        <th className="text-left p-4">Dealt</th>
                        <th className="text-left p-4">Taken</th>
                        <th className="text-left p-4">Healed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTeam1Players.map((player, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-purple-950' : ''}>
                          <td className="p-4 font-medium">{player.name}</td>
                          <td className="p-4">
                            {player.kills}/{player.deaths}
                            <span className="text-sm text-gray-400 ml-2">
                              ({player.deaths === 0 ? player.kills : (player.kills / player.deaths).toFixed(2)})
                            </span>
                          </td>
                          <td className="p-4">{player.debuffs}</td>
                          <td className="p-4">{player.damage.toLocaleString()}</td>
                          <td className="p-4">{player.damageTaken.toLocaleString()}</td>
                          <td className="p-4">{player.healing.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-purple-900 rounded-lg overflow-hidden">
                <div className="bg-purple-800 p-4">
                  <h2 className="text-xl font-bold text-red-400">
                    [Guild Defender] [{selectedMatch.result === 'Victory' ? 'Defeat' : 'Victory'}] {selectedMatch.team2}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-purple-800">
                      <tr>
                        <th className="text-left p-4">Player</th>
                        <th className="text-left p-4">K/D</th>
                        <th className="text-left p-4">Debuffs</th>
                        <th className="text-left p-4">Dealt</th>
                        <th className="text-left p-4">Taken</th>
                        <th className="text-left p-4">Healed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTeam2Players.map((player, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-purple-950' : ''}>
                          <td className="p-4 font-medium">{player.name}</td>
                          <td className="p-4">
                            {player.kills}/{player.deaths}
                            <span className="text-sm text-gray-400 ml-2">
                              ({player.deaths === 0 ? player.kills : (player.kills / player.deaths).toFixed(2)})
                            </span>
                          </td>
                          <td className="p-4">{player.debuffs}</td>
                          <td className="p-4">{player.damage.toLocaleString()}</td>
                          <td className="p-4">{player.damageTaken.toLocaleString()}</td>
                          <td className="p-4">{player.healing.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Rival Statistics</h1>
            <select
              className="bg-gray-800 px-4 py-2 rounded-lg"
              value={selectedRival}
              onChange={(e) => setSelectedRival(e.target.value)}
            >
              <option value="Guilty">Guilty</option>
              <option value="Allyance">Allyance</option>
            </select>
          </div>

          {/* Overall Stats */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Overall Stats vs {selectedRival}</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400 text-2xl mr-2">🏆</span>
                  <h3 className="text-xl font-bold">Total Matches</h3>
                </div>
                <p className="text-4xl text-yellow-400">{rivalStats.totalMatches}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400 text-2xl mr-2">👑</span>
                  <h3 className="text-xl font-bold">Victories</h3>
                </div>
                <p className="text-4xl text-green-500">{rivalStats.victories}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400 text-2xl mr-2">💀</span>
                  <h3 className="text-xl font-bold">Defeats</h3>
                </div>
                <p className="text-4xl text-red-500">{rivalStats.defeats}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400 text-2xl mr-2">📊</span>
                  <h3 className="text-xl font-bold">Win Rate</h3>
                </div>
                <p className="text-4xl text-yellow-400">{rivalStats.winRate}%</p>
              </div>
            </div>
          </section>

          {/* Performance Charts */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Performance Over Time</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Match Score</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={rivalStats.matchHistory}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 50,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                        formatter={(value: number, name: string) => [`${value} kills`, name]}
                      />
                      <Legend />
                      <Bar dataKey="kills" name="Manifest" fill="#10B981" />
                      <Bar dataKey="rivalKills" name={selectedRival} fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Damage Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={rivalStats.matchHistory}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 80,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                        formatter={(value) => value.toLocaleString()}
                      />
                      <Legend />
                      <Bar
                        dataKey="damage"
                        fill="#8B5CF6"
                        name="Manifest Damage"
                        stackId="a"
                      />
                      <Bar
                        dataKey="rivalDamage"
                        fill="#EC4899"
                        name={selectedRival}
                        stackId="a"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Debuffs Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rivalStats.matchHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Legend />
                      <Bar
                        dataKey="debuffs"
                        fill="#10B981"
                        name="Manifest Debuffs"
                        stackId="b"
                      />
                      <Bar
                        dataKey="rivalDebuffs"
                        fill="#EF4444"
                        name={selectedRival}
                        stackId="b"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Match Results</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rivalStats.matchHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Legend />
                      <Bar
                        dataKey={(data) => data.result === 'Victory' ? 1 : 0}
                        fill="#10B981"
                        name="Victory"
                        stackId="c"
                      />
                      <Bar
                        dataKey={(data) => data.result === 'Defeat' ? 1 : 0}
                        fill="#EF4444"
                        name="Defeat"
                        stackId="c"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          {/* Top Performers */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Top Performers</h2>
            
            {/* Manifest Top Performers */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-green-400">Manifest</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400 text-2xl mr-2">💀</span>
                    <h3 className="text-xl font-bold">Most Kills</h3>
                  </div>
                  <p className="text-xl font-bold mb-2">{rivalStats.topPerformers.manifest.kills.name}</p>
                  <p className="text-purple-400 mb-2">{rivalStats.topPerformers.manifest.kills.value} kills</p>
                  <p 
                    className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                    onClick={() => {
                      const match = matches.find(m => 
                        m.date === rivalStats.topPerformers.manifest.kills.date && 
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival)
                      );
                      if (match) setSelectedMatch(match);
                    }}
                  >
                    {rivalStats.topPerformers.manifest.kills.match}
                  </p>
                  <p className="text-sm text-gray-500">{rivalStats.topPerformers.manifest.kills.date}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400 text-2xl mr-2">😵</span>
                    <h3 className="text-xl font-bold">Most Deaths</h3>
                  </div>
                  <p className="text-xl font-bold mb-2">{rivalStats.topPerformers.manifest.deaths.name}</p>
                  <p className="text-purple-400 mb-2">{rivalStats.topPerformers.manifest.deaths.value} deaths</p>
                  <p 
                    className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                    onClick={() => {
                      const match = matches.find(m => 
                        m.date === rivalStats.topPerformers.manifest.deaths.date && 
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival)
                      );
                      if (match) setSelectedMatch(match);
                    }}
                  >
                    {rivalStats.topPerformers.manifest.deaths.match}
                  </p>
                  <p className="text-sm text-gray-500">{rivalStats.topPerformers.manifest.deaths.date}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400 text-2xl mr-2">⚡</span>
                    <h3 className="text-xl font-bold">Most Damage</h3>
                  </div>
                  <p className="text-xl font-bold mb-2">{rivalStats.topPerformers.manifest.damage.name}</p>
                  <p className="text-purple-400 mb-2">{rivalStats.topPerformers.manifest.damage.value.toLocaleString()} damage</p>
                  <p 
                    className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                    onClick={() => {
                      const match = matches.find(m => 
                        m.date === rivalStats.topPerformers.manifest.damage.date && 
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival)
                      );
                      if (match) setSelectedMatch(match);
                    }}
                  >
                    {rivalStats.topPerformers.manifest.damage.match}
                  </p>
                  <p className="text-sm text-gray-500">{rivalStats.topPerformers.manifest.damage.date}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400 text-2xl mr-2">🎯</span>
                    <h3 className="text-xl font-bold">Most Debuffs</h3>
                  </div>
                  <p className="text-xl font-bold mb-2">{rivalStats.topPerformers.manifest.debuffs.name}</p>
                  <p className="text-purple-400 mb-2">{rivalStats.topPerformers.manifest.debuffs.value} CCs</p>
                  <p 
                    className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                    onClick={() => {
                      const match = matches.find(m => 
                        m.date === rivalStats.topPerformers.manifest.debuffs.date && 
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival)
                      );
                      if (match) setSelectedMatch(match);
                    }}
                  >
                    {rivalStats.topPerformers.manifest.debuffs.match}
                  </p>
                  <p className="text-sm text-gray-500">{rivalStats.topPerformers.manifest.debuffs.date}</p>
                </div>
              </div>
            </div>

            {/* Rival Top Performers */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-red-400">Rival</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400 text-2xl mr-2">💀</span>
                    <h3 className="text-xl font-bold">Most Kills</h3>
                  </div>
                  <p className="text-xl font-bold mb-2">{rivalStats.topPerformers.rivals[selectedRival].kills.name}</p>
                  <p className="text-purple-400 mb-2">{rivalStats.topPerformers.rivals[selectedRival].kills.value} kills</p>
                  <p 
                    className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                    onClick={() => {
                      const match = matches.find(m => 
                        m.date === rivalStats.topPerformers.rivals[selectedRival].kills.date && 
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival)
                      );
                      if (match) setSelectedMatch(match);
                    }}
                  >
                    {rivalStats.topPerformers.rivals[selectedRival].kills.match}
                  </p>
                  <p className="text-sm text-gray-500">{rivalStats.topPerformers.rivals[selectedRival].kills.date}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400 text-2xl mr-2">😵</span>
                    <h3 className="text-xl font-bold">Most Deaths</h3>
                  </div>
                  <p className="text-xl font-bold mb-2">{rivalStats.topPerformers.rivals[selectedRival].deaths.name}</p>
                  <p className="text-purple-400 mb-2">{rivalStats.topPerformers.rivals[selectedRival].deaths.value} deaths</p>
                  <p 
                    className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                    onClick={() => {
                      const match = matches.find(m => 
                        m.date === rivalStats.topPerformers.rivals[selectedRival].deaths.date && 
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival)
                      );
                      if (match) setSelectedMatch(match);
                    }}
                  >
                    {rivalStats.topPerformers.rivals[selectedRival].deaths.match}
                  </p>
                  <p className="text-sm text-gray-500">{rivalStats.topPerformers.rivals[selectedRival].deaths.date}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400 text-2xl mr-2">⚡</span>
                    <h3 className="text-xl font-bold">Most Damage</h3>
                  </div>
                  <p className="text-xl font-bold mb-2">{rivalStats.topPerformers.rivals[selectedRival].damage.name}</p>
                  <p className="text-purple-400 mb-2">{rivalStats.topPerformers.rivals[selectedRival].damage.value.toLocaleString()} damage</p>
                  <p 
                    className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                    onClick={() => {
                      const match = matches.find(m => 
                        m.date === rivalStats.topPerformers.rivals[selectedRival].damage.date && 
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival)
                      );
                      if (match) setSelectedMatch(match);
                    }}
                  >
                    {rivalStats.topPerformers.rivals[selectedRival].damage.match}
                  </p>
                  <p className="text-sm text-gray-500">{rivalStats.topPerformers.rivals[selectedRival].damage.date}</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400 text-2xl mr-2">🎯</span>
                    <h3 className="text-xl font-bold">Most Debuffs</h3>
                  </div>
                  <p className="text-xl font-bold mb-2">{rivalStats.topPerformers.rivals[selectedRival].debuffs.name}</p>
                  <p className="text-purple-400 mb-2">{rivalStats.topPerformers.rivals[selectedRival].debuffs.value} CCs</p>
                  <p 
                    className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                    onClick={() => {
                      const match = matches.find(m => 
                        m.date === rivalStats.topPerformers.rivals[selectedRival].debuffs.date && 
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival)
                      );
                      if (match) setSelectedMatch(match);
                    }}
                  >
                    {rivalStats.topPerformers.rivals[selectedRival].debuffs.match}
                  </p>
                  <p className="text-sm text-gray-500">{rivalStats.topPerformers.rivals[selectedRival].debuffs.date}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Player Statistics */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Player Statistics</h2>
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-4 py-2 rounded-lg ${
                  compareMode ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                Compare Players
              </button>
            </div>

            {compareMode ? (
              // Player Comparison Mode
              <div className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  {/* Manifest Player Selector */}
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-green-400">Select Manifest Player</h3>
                    <input
                      type="text"
                      placeholder="Search Manifest player..."
                      className="w-full bg-gray-800 px-4 py-2 rounded-lg mb-4"
                      value={manifestPlayerSearch}
                      onChange={(e) => setManifestPlayerSearch(e.target.value)}
                    />
                    <div className="bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {filteredManifestPlayers.map((player) => (
                        <div
                          key={player.name}
                          className={`p-2 rounded cursor-pointer ${
                            selectedManifestPlayer === player.name
                              ? 'bg-purple-900 text-white'
                              : 'hover:bg-gray-700'
                          }`}
                          onClick={() => setSelectedManifestPlayer(player.name)}
                        >
                          {player.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rival Player Selector */}
                  <div>
                    <h3 className="text-2xl font-bold mb-4 text-red-400">Select {selectedRival} Player</h3>
                    <input
                      type="text"
                      placeholder={`Search ${selectedRival} player...`}
                      className="w-full bg-gray-800 px-4 py-2 rounded-lg mb-4"
                      value={rivalPlayerSearch}
                      onChange={(e) => setRivalPlayerSearch(e.target.value)}
                    />
                    <div className="bg-gray-800 rounded-lg p-4 max-h-60 overflow-y-auto">
                      {filteredRivalPlayers.map((player) => (
                        <div
                          key={player.name}
                          className={`p-2 rounded cursor-pointer ${
                            selectedRivalPlayer === player.name
                              ? 'bg-purple-900 text-white'
                              : 'hover:bg-gray-700'
                          }`}
                          onClick={() => setSelectedRivalPlayer(player.name)}
                        >
                          {player.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comparison Display */}
                {selectedManifestPlayer && selectedRivalPlayer && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-2xl font-bold mb-6">Player Comparison</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="text-center">
                        <h4 className="text-xl font-bold text-green-400 mb-4">{selectedManifestPlayer}</h4>
                        <div className="grid gap-4">
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">K/D Ratio</p>
                            <p className="text-3xl font-bold text-purple-400">
                              {((rivalStats.playerStats.get(selectedManifestPlayer)?.kills || 0) / 
                                (rivalStats.playerStats.get(selectedManifestPlayer)?.deaths || 1)).toFixed(2)}
                            </p>
                            <div className="flex justify-center items-center gap-2 mt-2">
                              <span className="text-green-400 text-lg font-semibold">
                                {rivalStats.playerStats.get(selectedManifestPlayer)?.kills || 0}
                              </span>
                              <span className="text-gray-500">/</span>
                              <span className="text-red-400 text-lg font-semibold">
                                {rivalStats.playerStats.get(selectedManifestPlayer)?.deaths || 0}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Win Rate</p>
                            <p className="text-2xl font-bold">
                              {((rivalStats.playerStats.get(selectedManifestPlayer)?.victories || 0) /
                                (rivalStats.playerStats.get(selectedManifestPlayer)?.matches || 1) *
                                100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Total Damage</p>
                            <p className="text-2xl font-bold">
                              {(rivalStats.playerStats.get(selectedManifestPlayer)?.damage || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Total Debuffs</p>
                            <p className="text-2xl font-bold">
                              {rivalStats.playerStats.get(selectedManifestPlayer)?.debuffs || 0}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="text-4xl font-bold text-purple-400">VS</div>
                      </div>

                      <div className="text-center">
                        <h4 className="text-xl font-bold text-red-400 mb-4">{selectedRivalPlayer}</h4>
                        <div className="grid gap-4">
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">K/D Ratio</p>
                            <p className="text-3xl font-bold text-purple-400">
                              {((rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.kills || 0) / 
                                (rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.deaths || 1)).toFixed(2)}
                            </p>
                            <div className="flex justify-center items-center gap-2 mt-2">
                              <span className="text-green-400 text-lg font-semibold">
                                {rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.kills || 0}
                              </span>
                              <span className="text-gray-500">/</span>
                              <span className="text-red-400 text-lg font-semibold">
                                {rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.deaths || 0}
                              </span>
                            </div>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Win Rate</p>
                            <p className="text-2xl font-bold">
                              {((rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.victories || 0) /
                                (rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.matches || 1) *
                                100).toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Total Damage</p>
                            <p className="text-2xl font-bold">
                              {(rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.damage || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Total Debuffs</p>
                            <p className="text-2xl font-bold">
                              {rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.debuffs || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Normal Player Statistics Mode
              <>
                {/* Manifest Players */}
                <div className="mb-12">
                  <h3 className="text-2xl font-bold mb-4 text-green-400">Manifest Players</h3>
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Search Manifest player by name..."
                      className="w-full md:w-96 bg-gray-800 px-4 py-2 rounded-lg"
                      value={manifestPlayerSearch}
                      onChange={(e) => setManifestPlayerSearch(e.target.value)}
                    />
                  </div>

                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-900">
                          <tr>
                            <th className="text-left p-4">Player</th>
                            <th className="text-left p-4">Matches</th>
                            <th className="text-left p-4">Win Rate</th>
                            <th className="text-left p-4">K/D</th>
                            <th className="text-left p-4">Kills</th>
                            <th className="text-left p-4">Deaths</th>
                            <th className="text-left p-4">Debuffs</th>
                            <th className="text-left p-4">Damage</th>
                            <th className="text-left p-4">Taken</th>
                            <th className="text-left p-4">Healing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredManifestPlayers.map((player, index) => (
                            <tr key={player.name} className={index % 2 === 0 ? 'bg-gray-900' : ''}>
                              <td className="p-4 font-medium">{player.name}</td>
                              <td className="p-4">{player.matches}</td>
                              <td className="p-4">{player.winRate}%</td>
                              <td className="p-4">{player.kd}</td>
                              <td className="p-4">{player.kills}</td>
                              <td className="p-4">{player.deaths}</td>
                              <td className="p-4">{player.debuffs}</td>
                              <td className="p-4">{player.damage.toLocaleString()}</td>
                              <td className="p-4">{player.damageTaken.toLocaleString()}</td>
                              <td className="p-4">{player.healing.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Rival Players */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-red-400">{selectedRival} Players</h3>
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder={`Search ${selectedRival} player...`}
                      className="w-full bg-gray-800 px-4 py-2 rounded-lg mb-4"
                      value={rivalPlayerSearch}
                      onChange={(e) => setRivalPlayerSearch(e.target.value)}
                    />
                  </div>

                  <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-900">
                          <tr>
                            <th className="text-left p-4">Player</th>
                            <th className="text-left p-4">Matches</th>
                            <th className="text-left p-4">Win Rate</th>
                            <th className="text-left p-4">K/D</th>
                            <th className="text-left p-4">Kills</th>
                            <th className="text-left p-4">Deaths</th>
                            <th className="text-left p-4">Debuffs</th>
                            <th className="text-left p-4">Damage</th>
                            <th className="text-left p-4">Taken</th>
                            <th className="text-left p-4">Healing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRivalPlayers.map((player, index) => (
                            <tr key={player.name} className={index % 2 === 0 ? 'bg-gray-900' : ''}>
                              <td className="p-4 font-medium">{player.name}</td>
                              <td className="p-4">{player.matches}</td>
                              <td className="p-4">{player.winRate}%</td>
                              <td className="p-4">{player.kd}</td>
                              <td className="p-4">{player.kills}</td>
                              <td className="p-4">{player.deaths}</td>
                              <td className="p-4">{player.debuffs}</td>
                              <td className="p-4">{player.damage.toLocaleString()}</td>
                              <td className="p-4">{player.damageTaken.toLocaleString()}</td>
                              <td className="p-4">{player.healing.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}