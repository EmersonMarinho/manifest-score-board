"use client";

import React from 'react';
import Navbar from '../components/Navbar';
import { Match } from '../data/matches';

type SortField = 'kd' | 'kills' | 'deaths' | 'debuffs' | 'damage' | 'damageTaken' | 'healing';
type SortOrder = 'asc' | 'desc';

export default function Leaderboard() {
  const [selectedSeason, setSelectedSeason] = React.useState('2025');
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [guildSearchTerm, setGuildSearchTerm] = React.useState('');
  const [playerSearchTerm, setPlayerSearchTerm] = React.useState('');
  const [selectedGuild, setSelectedGuild] = React.useState('');
  const [selectedResult, setSelectedResult] = React.useState<'Victory' | 'Defeat' | ''>('');
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);
  const [sortField, setSortField] = React.useState<SortField>('kd');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = React.useState(1);
  const matchesPerPage = 9;

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

  // Calculate Manifest's stats
  const manifestStats = React.useMemo(() => {
    const manifestMatches = matches.filter(match => match.team1 === 'Manifest');
    const totalMatches = manifestMatches.length;
    const victories = manifestMatches.filter(m => m.result === 'Victory').length;
    const defeats = totalMatches - victories;
    const winRate = totalMatches > 0 ? Math.round((victories / totalMatches) * 100) : 0;

    // Calculate player statistics
    const playerStats = new Map();
    manifestMatches.forEach(match => {
      match.team1Players.forEach(player => {
        const stats = playerStats.get(player.name) || {
          kills: 0,
          deaths: 0,
          debuffs: 0,
          damage: 0,
          matches: 0
        };
        stats.kills += player.kills;
        stats.deaths += player.deaths;
        stats.debuffs += player.debuffs;
        stats.damage += player.damage;
        stats.matches += 1;
        playerStats.set(player.name, stats);
      });
    });

    // Find top performers
    let topKills = { name: '', value: 0 };
    let topDeaths = { name: '', value: 0 };
    let topDamage = { name: '', value: 0 };
    let topDebuffs = { name: '', value: 0 };

    playerStats.forEach((stats, name) => {
      if (stats.kills > topKills.value) {
        topKills = { name, value: stats.kills };
      }
      if (stats.deaths > topDeaths.value) {
        topDeaths = { name, value: stats.deaths };
      }
      if (stats.damage > topDamage.value) {
        topDamage = { name, value: stats.damage };
      }
      if (stats.debuffs > topDebuffs.value) {
        topDebuffs = { name, value: stats.debuffs };
      }
    });

    return {
      totalMatches,
      victories,
      defeats,
      winRate,
      topKills,
      topDeaths,
      topDamage,
      topDebuffs
    };
  }, [matches]);

  // Calculate player statistics across all matches
  const playerStats = React.useMemo(() => {
    const stats = new Map();
    
    matches.forEach(match => {
      // Only process Manifest players
      const manifestPlayers = match.team1 === 'Manifest' ? match.team1Players : 
                            match.team2 === 'Manifest' ? match.team2Players : [];
      const isTeam1 = match.team1 === 'Manifest';
      
      manifestPlayers.forEach(player => {
        const currentStats = stats.get(player.name) || {
          kills: 0,
          deaths: 0,
          debuffs: 0,
          damage: 0,
          damageTaken: 0,
          healing: 0,
          matches: 0,
          victories: 0,
          defeats: 0
        };
        
        currentStats.kills += player.kills;
        currentStats.deaths += player.deaths;
        currentStats.debuffs += player.debuffs;
        currentStats.damage += player.damage;
        currentStats.damageTaken += player.damageTaken;
        currentStats.healing += player.healing;
        currentStats.matches += 1;
        
        if ((isTeam1 && match.result === 'Victory') || (!isTeam1 && match.result === 'Defeat')) {
          currentStats.victories += 1;
        } else {
          currentStats.defeats += 1;
        }
        
        stats.set(player.name, currentStats);
      });
    });

    return stats;
  }, [matches]);

  // Filter matches based on guild search term and selections
  const filteredMatches = React.useMemo(() => {
    return matches
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, newest first
      .filter(match => {
        const matchesGuildSearch = guildSearchTerm === '' || 
          match.team1.toLowerCase().includes(guildSearchTerm.toLowerCase()) ||
          match.team2.toLowerCase().includes(guildSearchTerm.toLowerCase());

        const matchesGuild = selectedGuild === '' ||
          match.team1 === selectedGuild ||
          match.team2 === selectedGuild;

        const matchesResult = selectedResult === '' || match.result === selectedResult;

        return matchesGuildSearch && matchesGuild && matchesResult;
      });
  }, [matches, guildSearchTerm, selectedGuild, selectedResult]);

  // Filter players based on player search term
  const filteredPlayers = React.useMemo(() => {
    const players = Array.from(playerStats.entries()).map(([name, stats]) => ({
      name,
      ...stats,
      kd: stats.deaths === 0 ? stats.kills : (stats.kills / stats.deaths).toFixed(2),
      winRate: ((stats.victories / (stats.victories + stats.defeats)) * 100).toFixed(1)
    }));

    if (!playerSearchTerm) return players;

    return players.filter(player =>
      player.name.toLowerCase().includes(playerSearchTerm.toLowerCase())
    );
  }, [playerStats, playerSearchTerm]);

  // Find top performers from individual matches
  const topPerformers = React.useMemo(() => {
    const allPlayers: Array<{
      name: string;
      kills: number;
      deaths: number;
      debuffs: number;
      damage: number;
      match: string;
      date: string;
    }> = [];

    matches.forEach(match => {
      // Process team1 players if it's Manifest
      if (match.team1 === 'Manifest') {
        match.team1Players.forEach(player => {
          allPlayers.push({
            name: player.name,
            kills: player.kills,
            deaths: player.deaths,
            debuffs: player.debuffs,
            damage: player.damage,
            match: `${match.team1} vs ${match.team2}`,
            date: match.date
          });
        });
      }
      // Process team2 players if it's Manifest
      if (match.team2 === 'Manifest') {
        match.team2Players.forEach(player => {
          allPlayers.push({
            name: player.name,
            kills: player.kills,
            deaths: player.deaths,
            debuffs: player.debuffs,
            damage: player.damage,
            match: `${match.team1} vs ${match.team2}`,
            date: match.date
          });
        });
      }
    });

    // Filter players if there's a search term
    const filteredPlayers = playerSearchTerm
      ? allPlayers.filter(p => p.name.toLowerCase().includes(playerSearchTerm.toLowerCase()))
      : allPlayers;

    if (filteredPlayers.length === 0) {
      return {
        topKills: { name: '', value: 0, match: '', date: '' },
        topDeaths: { name: '', value: 0, match: '', date: '' },
        topDamage: { name: '', value: 0, match: '', date: '' },
        topDebuffs: { name: '', value: 0, match: '', date: '' }
      };
    }

    return {
      topKills: filteredPlayers.reduce((max, p) => 
        p.kills > max.value ? { name: p.name, value: p.kills, match: p.match, date: p.date } : max,
        { name: '', value: 0, match: '', date: '' }
      ),
      topDeaths: filteredPlayers.reduce((max, p) => 
        p.deaths > max.value ? { name: p.name, value: p.deaths, match: p.match, date: p.date } : max,
        { name: '', value: 0, match: '', date: '' }
      ),
      topDamage: filteredPlayers.reduce((max, p) => 
        p.damage > max.value ? { name: p.name, value: p.damage, match: p.match, date: p.date } : max,
        { name: '', value: 0, match: '', date: '' }
      ),
      topDebuffs: filteredPlayers.reduce((max, p) => 
        p.debuffs > max.value ? { name: p.name, value: p.debuffs, match: p.match, date: p.date } : max,
        { name: '', value: 0, match: '', date: '' }
      )
    };
  }, [matches, playerSearchTerm]);

  const sortPlayers = (players: any[]) => {
    return [...players].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'kd':
          aValue = a.deaths === 0 ? a.kills : a.kills / a.deaths;
          bValue = b.deaths === 0 ? b.kills : b.kills / b.deaths;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  };

  const SortButton = ({ field, label }: { field: SortField, label: string }) => (
    <button
      onClick={() => {
        if (sortField === field) {
          setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
          setSortField(field);
          setSortOrder('desc');
        }
      }}
      className={`px-4 py-2 text-sm rounded ${
        sortField === field 
          ? 'bg-purple-600 text-white' 
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {label}
      {sortField === field && (
        <span className="ml-1">
          {sortOrder === 'desc' ? '↓' : '↑'}
        </span>
      )}
    </button>
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredMatches.length / matchesPerPage);
  const paginatedMatches = filteredMatches.slice(
    (currentPage - 1) * matchesPerPage,
    currentPage * matchesPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: document.getElementById('matches-section')?.offsetTop, behavior: 'smooth' });
  };

  if (selectedMatch) {
    const sortedTeam1Players = sortPlayers(selectedMatch.team1Players);
    const sortedTeam2Players = sortPlayers(selectedMatch.team2Players);

    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-black text-white pt-16">
          <div className="container mx-auto px-4 py-8">
            {/* Back button */}
            <button
              onClick={() => setSelectedMatch(null)}
              className="flex items-center text-purple-500 hover:text-purple-400 mb-8"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              BACK TO MATCHES
            </button>

            {/* Match header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">
                {selectedMatch.team1} vs {selectedMatch.team2}
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Sort by:</span>
                <SortButton field="kd" label="K/D" />
                <SortButton field="kills" label="Kills" />
                <SortButton field="deaths" label="Deaths" />
                <SortButton field="debuffs" label="Debuffs" />
                <SortButton field="damage" label="Damage" />
                <SortButton field="damageTaken" label="Damage Taken" />
                <SortButton field="healing" label="Healing" />
              </div>
            </div>

            {/* Teams */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Team 1 */}
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

              {/* Team 2 */}
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
            <h1 className="text-4xl font-bold">Guild League Leaderboard</h1>
          </div>

          {/* Current Standing */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Current <span className="text-yellow-400">Standing</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400 text-2xl mr-2">🏆</span>
                  <h3 className="text-xl font-bold">Total Matches</h3>
                </div>
                <p className="text-4xl text-yellow-400">{manifestStats.totalMatches}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400 text-2xl mr-2">👑</span>
                  <h3 className="text-xl font-bold">Victories</h3>
                </div>
                <p className="text-4xl text-green-500">{manifestStats.victories}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400 text-2xl mr-2">💀</span>
                  <h3 className="text-xl font-bold">Defeats</h3>
                </div>
                <p className="text-4xl text-red-500">{manifestStats.defeats}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400 text-2xl mr-2">📊</span>
                  <h3 className="text-xl font-bold">Win Rate</h3>
                </div>
                <p className="text-4xl text-yellow-400">{manifestStats.winRate}%</p>
              </div>
            </div>
          </section>

          {/* Player Statistics */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Player <span className="text-yellow-400">Statistics</span></h2>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search Manifest player by name..."
                className="w-full md:w-96 bg-gray-800 px-4 py-2 rounded-lg"
                value={playerSearchTerm}
                onChange={(e) => setPlayerSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400 text-2xl mr-2">💀</span>
                  <h3 className="text-xl font-bold">Most Kills</h3>
                </div>
                <p className="text-xl font-bold mb-2">{topPerformers.topKills.name}</p>
                <p className="text-purple-400 mb-2">{topPerformers.topKills.value} kills</p>
                <p 
                  className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                  onClick={() => {
                    const match = matches.find(m => 
                      m.date === topPerformers.topKills.date && 
                      (m.team1 === 'Manifest' ? m.team2 === topPerformers.topKills.match.split(' vs ')[1] : m.team1 === topPerformers.topKills.match.split(' vs ')[1])
                    );
                    if (match) setSelectedMatch(match);
                  }}
                >
                  {topPerformers.topKills.match}
                </p>
                <p className="text-sm text-gray-500">{topPerformers.topKills.date}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400 text-2xl mr-2">😵</span>
                  <h3 className="text-xl font-bold">Most Deaths</h3>
                </div>
                <p className="text-xl font-bold mb-2">{topPerformers.topDeaths.name}</p>
                <p className="text-purple-400 mb-2">{topPerformers.topDeaths.value} deaths</p>
                <p 
                  className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                  onClick={() => {
                    const match = matches.find(m => 
                      m.date === topPerformers.topDeaths.date && 
                      (m.team1 === 'Manifest' ? m.team2 === topPerformers.topDeaths.match.split(' vs ')[1] : m.team1 === topPerformers.topDeaths.match.split(' vs ')[1])
                    );
                    if (match) setSelectedMatch(match);
                  }}
                >
                  {topPerformers.topDeaths.match}
                </p>
                <p className="text-sm text-gray-500">{topPerformers.topDeaths.date}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400 text-2xl mr-2">⚡</span>
                  <h3 className="text-xl font-bold">Most Damage</h3>
                </div>
                <p className="text-xl font-bold mb-2">{topPerformers.topDamage.name}</p>
                <p className="text-purple-400 mb-2">{topPerformers.topDamage.value.toLocaleString()} damage</p>
                <p 
                  className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                  onClick={() => {
                    const match = matches.find(m => 
                      m.date === topPerformers.topDamage.date && 
                      (m.team1 === 'Manifest' ? m.team2 === topPerformers.topDamage.match.split(' vs ')[1] : m.team1 === topPerformers.topDamage.match.split(' vs ')[1])
                    );
                    if (match) setSelectedMatch(match);
                  }}
                >
                  {topPerformers.topDamage.match}
                </p>
                <p className="text-sm text-gray-500">{topPerformers.topDamage.date}</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <span className="text-yellow-400 text-2xl mr-2">🎯</span>
                  <h3 className="text-xl font-bold">Most Debuffs</h3>
                </div>
                <p className="text-xl font-bold mb-2">{topPerformers.topDebuffs.name}</p>
                <p className="text-purple-400 mb-2">{topPerformers.topDebuffs.value} CCs</p>
                <p 
                  className="text-sm text-gray-400 hover:text-purple-400 cursor-pointer"
                  onClick={() => {
                    const match = matches.find(m => 
                      m.date === topPerformers.topDebuffs.date && 
                      (m.team1 === 'Manifest' ? m.team2 === topPerformers.topDebuffs.match.split(' vs ')[1] : m.team1 === topPerformers.topDebuffs.match.split(' vs ')[1])
                    );
                    if (match) setSelectedMatch(match);
                  }}
                >
                  {topPerformers.topDebuffs.match}
                </p>
                <p className="text-sm text-gray-500">{topPerformers.topDebuffs.date}</p>
              </div>
            </div>

            {playerSearchTerm && filteredPlayers.length > 0 && (
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
                      {filteredPlayers.map((player, index) => (
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
            )}

            {playerSearchTerm && filteredPlayers.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No Manifest players found matching "{playerSearchTerm}"
              </div>
            )}
          </section>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <select
              className="bg-gray-800 px-4 py-2 rounded-lg"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
            >
              <option value="">Select Season</option>
              <option value="2024">Season 2025</option>
            </select>

            <select
              className="bg-gray-800 px-4 py-2 rounded-lg"
              value={selectedGuild}
              onChange={(e) => setSelectedGuild(e.target.value)}
            >
              <option value="">All Guilds</option>
              {Array.from(new Set(matches.map(m => [m.team1, m.team2]).flat())).map(guild => (
                <option key={guild} value={guild}>{guild}</option>
              ))}
            </select>

            <select
              className="bg-gray-800 px-4 py-2 rounded-lg"
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value as 'Victory' | 'Defeat' | '')}
            >
              <option value="">All Results</option>
              <option value="Victory">Victories</option>
              <option value="Defeat">Defeats</option>
            </select>

            <input
              type="text"
              placeholder="Search by guild name..."
              className="bg-gray-800 px-4 py-2 rounded-lg flex-grow"
              value={guildSearchTerm}
              onChange={(e) => setGuildSearchTerm(e.target.value)}
            />
          </div>

          {/* Match cards */}
          <div id="matches-section" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedMatches.map((match) => (
                <div
                  key={match._id}
                  className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => setSelectedMatch(match)}
                >
                  {/* Match header */}
                  <div className="bg-gray-900 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">{match.date}</span>
                      <span className={`px-3 py-1 rounded ${
                        match.result === 'Victory' 
                          ? 'bg-green-900 text-green-400' 
                          : 'bg-red-900 text-red-400'
                      }`}>
                        {match.result}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold">{match.team1} vs {match.team2}</h3>
                  </div>

                  {/* Match score */}
                  <div className="p-4">
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span className={match.result === 'Victory' ? 'text-green-400' : 'text-red-400'}>
                        {match.team1Score}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className={match.result === 'Victory' ? 'text-red-400' : 'text-green-400'}>
                        {match.team2Score}
                      </span>
                    </div>
                  </div>

                  {/* Match stats */}
                  <div className="border-t border-gray-700 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Total Kills</div>
                        <div className="font-bold">
                          {match.team1Players.reduce((sum, p) => sum + p.kills, 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400 mb-1">Total Damage</div>
                        <div className="font-bold">
                          {match.team1Players.reduce((sum, p) => sum + p.damage, 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
} 