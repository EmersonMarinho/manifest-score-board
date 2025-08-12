"use client";

import React, { Suspense } from 'react';
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
import { useRouter, useSearchParams } from 'next/navigation';

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

function RivalStatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rivalFromUrl = searchParams.get('rival');
  
  const [selectedRival, setSelectedRival] = React.useState(rivalFromUrl || 'Guilty');
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);
  const [manifestPlayerSearch, setManifestPlayerSearch] = React.useState('');
  const [rivalPlayerSearch, setRivalPlayerSearch] = React.useState('');
  const [compareMode, setCompareMode] = React.useState(false);
  const [selectedManifestPlayer, setSelectedManifestPlayer] = React.useState('');
  const [selectedRivalPlayer, setSelectedRivalPlayer] = React.useState('');
  
  // Estados para os modais de player
  const [showPlayerMatchesModal, setShowPlayerMatchesModal] = React.useState(false);
  const [showMatchDetailsModal, setShowMatchDetailsModal] = React.useState(false);
  const [selectedPlayerForModal, setSelectedPlayerForModal] = React.useState('');
  const [selectedMatchForModal, setSelectedMatchForModal] = React.useState<Match | null>(null);
  
  // Estados de ordenação separados para cada tabela
  const [manifestSortBy, setManifestSortBy] = React.useState<'name' | 'kd' | 'kills' | 'deaths' | 'debuffs' | 'damage' | 'damageTaken' | 'healing' | 'matches' | 'winRate'>('kills');
  const [manifestSortOrder, setManifestSortOrder] = React.useState<'asc' | 'desc'>('desc');
  
  const [rivalSortBy, setRivalSortBy] = React.useState<'name' | 'kd' | 'kills' | 'deaths' | 'debuffs' | 'damage' | 'damageTaken' | 'healing' | 'matches' | 'winRate'>('kills');
  const [rivalSortOrder, setRivalSortOrder] = React.useState<'asc' | 'desc'>('desc');

  // Funções de ordenação separadas para cada tabela
  const handleManifestSort = (field: 'name' | 'kd' | 'kills' | 'deaths' | 'debuffs' | 'damage' | 'damageTaken' | 'healing' | 'matches' | 'winRate') => {
    if (field === manifestSortBy) {
      setManifestSortOrder(manifestSortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setManifestSortBy(field);
      setManifestSortOrder('desc');
    }
  };

  const handleRivalSort = (field: 'name' | 'kd' | 'kills' | 'deaths' | 'debuffs' | 'damage' | 'damageTaken' | 'healing' | 'matches' | 'winRate') => {
    if (field === rivalSortBy) {
      setRivalSortOrder(rivalSortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setRivalSortBy(field);
      setRivalSortOrder('desc');
    }
  };

  // Componentes para cabeçalhos ordenáveis separados
  const ManifestSortableHeader = ({ field, label }: { field: 'name' | 'kd' | 'kills' | 'deaths' | 'debuffs' | 'damage' | 'damageTaken' | 'healing' | 'matches' | 'winRate', label: string }) => (
    <th 
      className="text-left p-4 cursor-pointer hover:bg-gray-700"
      onClick={() => handleManifestSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {manifestSortBy === field && (
          <span className="ml-1">{manifestSortOrder === 'desc' ? '↓' : '↑'}</span>
        )}
      </div>
    </th>
  );

  const RivalSortableHeader = ({ field, label }: { field: 'name' | 'kd' | 'kills' | 'deaths' | 'debuffs' | 'damage' | 'damageTaken' | 'healing' | 'matches' | 'winRate', label: string }) => (
    <th 
      className="text-left p-4 cursor-pointer hover:bg-gray-700"
      onClick={() => handleRivalSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {rivalSortBy === field && (
          <span className="ml-1">{rivalSortOrder === 'desc' ? '↓' : '↑'}</span>
        )}
      </div>
    </th>
  );

  // Redirect to Guilty if no rival is specified
  React.useEffect(() => {
    if (!rivalFromUrl) {
      router.push('/rival-stats?rival=Guilty');
    }
  }, [rivalFromUrl, router]);

  // Update URL when rival changes
  const handleRivalChange = (rival: string) => {
    setSelectedRival(rival);
    router.push(`/rival-stats?rival=${rival}`);
  };

  // Função para abrir modal de partidas do player
  const openPlayerMatchesModal = (playerName: string) => {
    setSelectedPlayerForModal(playerName);
    setShowPlayerMatchesModal(true);
  };

  // Função para abrir modal de detalhes da partida
  const openMatchDetailsModal = (match: Match) => {
    setSelectedMatchForModal(match);
    setShowMatchDetailsModal(true);
  };

  // Função para fechar modais
  const closeModals = () => {
    setShowPlayerMatchesModal(false);
    setShowMatchDetailsModal(false);
    setSelectedPlayerForModal('');
    setSelectedMatchForModal(null);
  };

  // Função para voltar do modal de detalhes para o modal de partidas
  const goBackToPlayerMatches = () => {
    setShowMatchDetailsModal(false);
    setSelectedMatchForModal(null);
    // Mantém o modal de partidas do player aberto
  };

  React.useEffect(() => {
    if (rivalFromUrl && rivalFromUrl !== selectedRival) {
      setSelectedRival(rivalFromUrl);
    }
  }, [rivalFromUrl]);

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

  // Função para obter partidas de um player específico contra o rival selecionado
  const getPlayerMatches = (playerName: string) => {
    return matches.filter(match => {
      const isManifestMatch = (match.team1 === 'Manifest' && match.team2 === selectedRival) ||
                             (match.team2 === 'Manifest' && match.team1 === selectedRival);
      
      if (!isManifestMatch) return false;
      
      const manifestPlayers = match.team1 === 'Manifest' ? match.team1Players : match.team2Players;
      const rivalPlayers = match.team1 === selectedRival ? match.team1Players : match.team2Players;
      
      return manifestPlayers.some(p => p.name === playerName) || 
             rivalPlayers.some(p => p.name === playerName);
    });
  };

  // Filter and sort players based on search terms and sort criteria
  const filteredManifestPlayers = React.useMemo(() => {
    const players = Array.from(rivalStats.playerStats.entries()).map(([name, stats]) => ({
      name,
      ...stats,
      kd: stats.deaths === 0 ? stats.kills : (stats.kills / stats.deaths).toFixed(2),
      winRate: ((stats.victories / stats.matches) * 100).toFixed(1)
    }));

    let filteredPlayers = players;
    if (manifestPlayerSearch) {
      filteredPlayers = players.filter(player =>
        player.name.toLowerCase().includes(manifestPlayerSearch.toLowerCase())
      );
    }

    // Apply sorting
    return filteredPlayers.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (manifestSortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'matches':
          aValue = a.matches;
          bValue = b.matches;
          break;
        case 'winRate':
          aValue = parseFloat(a.winRate);
          bValue = parseFloat(b.winRate);
          break;
        case 'kd':
          aValue = parseFloat(String(a.kd));
          bValue = parseFloat(String(b.kd));
          break;
        case 'kills':
          aValue = a.kills;
          bValue = b.kills;
          break;
        case 'deaths':
          aValue = a.deaths;
          bValue = b.deaths;
          break;
        case 'debuffs':
          aValue = a.debuffs;
          bValue = b.debuffs;
          break;
        case 'damage':
          aValue = a.damage;
          bValue = b.damage;
          break;
        case 'damageTaken':
          aValue = a.damageTaken;
          bValue = b.damageTaken;
          break;
        case 'healing':
          aValue = a.healing;
          bValue = b.healing;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return manifestSortOrder === 'desc' ? String(bValue).localeCompare(String(aValue)) : String(aValue).localeCompare(String(bValue));
      } else {
        return manifestSortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }
    });
  }, [rivalStats, manifestPlayerSearch, manifestSortBy, manifestSortOrder]);

  const filteredRivalPlayers = React.useMemo(() => {
    const players = Array.from(rivalStats.rivalPlayerStats[selectedRival].entries()).map(([name, stats]) => ({
      name,
      ...stats,
      kd: stats.deaths === 0 ? stats.kills : (stats.kills / stats.deaths).toFixed(2),
      winRate: ((stats.victories / stats.matches) * 100).toFixed(1)
    }));

    let filteredPlayers = players;
    if (rivalPlayerSearch) {
      filteredPlayers = players.filter(player =>
        player.name.toLowerCase().includes(rivalPlayerSearch.toLowerCase())
      );
    }

    // Apply sorting
    return filteredPlayers.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (rivalSortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'matches':
          aValue = a.matches;
          bValue = b.matches;
          break;
        case 'winRate':
          aValue = parseFloat(a.winRate);
          bValue = parseFloat(b.winRate);
          break;
        case 'kd':
          aValue = parseFloat(String(a.kd));
          bValue = parseFloat(String(b.kd));
          break;
        case 'kills':
          aValue = a.kills;
          bValue = b.kills;
          break;
        case 'deaths':
          aValue = a.deaths;
          bValue = b.deaths;
          break;
        case 'debuffs':
          aValue = a.debuffs;
          bValue = b.debuffs;
          break;
        case 'damage':
          aValue = a.damage;
          bValue = b.damage;
          break;
        case 'damageTaken':
          aValue = a.damageTaken;
          bValue = b.damageTaken;
          break;
        case 'healing':
          aValue = a.healing;
          bValue = b.healing;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return rivalSortOrder === 'desc' ? String(bValue).localeCompare(String(aValue)) : String(aValue).localeCompare(String(bValue));
      } else {
        return rivalSortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }
    });
  }, [rivalStats, rivalPlayerSearch, selectedRival, rivalSortBy, rivalSortOrder]);

  if (selectedMatch) {
    const sortPlayers = (players: any[]) => {
      const sortedPlayers = [...players].sort((a, b) => {
        switch (manifestSortBy) {
          case 'kd':
            const kdA = a.deaths === 0 ? a.kills : a.kills / a.deaths;
            const kdB = b.deaths === 0 ? b.kills : b.kills / b.deaths;
            return manifestSortOrder === 'desc' ? kdB - kdA : kdA - kdB;
          case 'kills':
            return manifestSortOrder === 'desc' ? b.kills - a.kills : a.kills - b.kills;
          case 'deaths':
            return manifestSortOrder === 'desc' ? b.deaths - a.deaths : a.deaths - b.deaths;
          case 'debuffs':
            return manifestSortOrder === 'desc' ? b.debuffs - a.debuffs : a.debuffs - b.debuffs;
          case 'damage':
            return manifestSortOrder === 'desc' ? b.damage - a.damage : a.damage - b.damage;
          case 'damageTaken':
            return manifestSortOrder === 'desc' ? b.damageTaken - a.damageTaken : a.damageTaken - b.damageTaken;
          case 'healing':
            return manifestSortOrder === 'desc' ? b.healing - a.healing : a.healing - b.healing;
          default:
            return 0;
        }
      });
      return sortedPlayers;
    };

    const handleSort = (newSortBy: typeof manifestSortBy) => {
      if (newSortBy === manifestSortBy) {
        setManifestSortOrder(manifestSortOrder === 'desc' ? 'asc' : 'desc');
      } else {
        setManifestSortBy(newSortBy);
        setManifestSortOrder('desc');
      }
    };

    const SortIcon = ({ active, order }: { active: boolean; order: 'asc' | 'desc' }) => (
      <svg
        className={`h-4 w-4 inline-block ml-1 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={order === 'desc' ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"}
        />
      </svg>
    );

    const TableHeader = ({ label, value }: { label: string; value: typeof manifestSortBy }) => (
      <th 
        className="text-left p-4 cursor-pointer group hover:bg-purple-700 transition-colors"
        onClick={() => handleSort(value)}
      >
        <span className="flex items-center">
          {label}
          <SortIcon active={manifestSortBy === value} order={manifestSortOrder} />
        </span>
      </th>
    );

    const sortedTeam1Players = sortPlayers(selectedMatch.team1Players);
    const sortedTeam2Players = sortPlayers(selectedMatch.team2Players);

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
                        <TableHeader label="K/D" value="kd" />
                        <TableHeader label="Debuffs" value="debuffs" />
                        <TableHeader label="Dealt" value="damage" />
                        <TableHeader label="Taken" value="damageTaken" />
                        <TableHeader label="Healed" value="healing" />
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
                        <TableHeader label="K/D" value="kd" />
                        <TableHeader label="Debuffs" value="debuffs" />
                        <TableHeader label="Dealt" value="damage" />
                        <TableHeader label="Taken" value="damageTaken" />
                        <TableHeader label="Healed" value="healing" />
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
            <div className="flex items-center gap-4">
              <select
                className="bg-gray-800 px-4 py-2 rounded-lg"
                value={selectedRival}
                onChange={(e) => handleRivalChange(e.target.value)}
              >
                <option value="Guilty">Guilty</option>
                <option value="Allyance">Allyance</option>
              </select>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/rival-stats?rival=${selectedRival}`;
                  navigator.clipboard.writeText(url);
                  alert('URL copied to clipboard!');
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Share Stats
              </button>
            </div>
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
            <div className="grid grid-cols-1 gap-8">
              {/* Match Score - Full width */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">Match Score</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={rivalStats.matchHistory.filter(match => match.rivalGuild === selectedRival)}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 50,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
                        labelStyle={{ color: '#9CA3AF' }}
                      />
                      <Legend />
                      <Bar
                        dataKey="kills"
                        fill="#10B981"
                        name="Manifest"
                      />
                      <Bar
                        dataKey="rivalKills"
                        fill="#EF4444"
                        name={selectedRival}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Damage and Debuffs - Side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Damage Comparison</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={rivalStats.matchHistory.filter(match => match.rivalGuild === selectedRival)}
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
                          fill="#10B981"
                          name="Manifest"
                        />
                        <Bar
                          dataKey="rivalDamage"
                          fill="#EF4444"
                          name={selectedRival}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Debuffs Comparison</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={rivalStats.matchHistory.filter(match => match.rivalGuild === selectedRival)}
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
                        />
                        <Legend />
                        <Bar
                          dataKey="debuffs"
                          fill="#10B981"
                          name="Manifest"
                        />
                        <Bar
                          dataKey="rivalDebuffs"
                          fill="#EF4444"
                          name={selectedRival}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival) &&
                        (m.team1 === 'Manifest' 
                          ? m.team1Players.some(p => p.name === rivalStats.topPerformers.manifest.kills.name && p.kills === rivalStats.topPerformers.manifest.kills.value)
                          : m.team2Players.some(p => p.name === rivalStats.topPerformers.manifest.kills.name && p.kills === rivalStats.topPerformers.manifest.kills.value)
                        )
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
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival) &&
                        (m.team1 === 'Manifest' 
                          ? m.team1Players.some(p => p.name === rivalStats.topPerformers.manifest.deaths.name && p.deaths === rivalStats.topPerformers.manifest.deaths.value)
                          : m.team2Players.some(p => p.name === rivalStats.topPerformers.manifest.deaths.name && p.deaths === rivalStats.topPerformers.manifest.deaths.value)
                        )
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
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival) &&
                        (m.team1 === 'Manifest' 
                          ? m.team1Players.some(p => p.name === rivalStats.topPerformers.manifest.damage.name && p.damage === rivalStats.topPerformers.manifest.damage.value)
                          : m.team2Players.some(p => p.name === rivalStats.topPerformers.manifest.damage.name && p.damage === rivalStats.topPerformers.manifest.damage.value)
                        )
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
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival) &&
                        (m.team1 === 'Manifest' 
                          ? m.team1Players.some(p => p.name === rivalStats.topPerformers.manifest.debuffs.name && p.debuffs === rivalStats.topPerformers.manifest.debuffs.value)
                          : m.team2Players.some(p => p.name === rivalStats.topPerformers.manifest.debuffs.name && p.debuffs === rivalStats.topPerformers.manifest.debuffs.value)
                        )
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
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival) &&
                        (m.team1 === selectedRival
                          ? m.team1Players.some(p => p.name === rivalStats.topPerformers.rivals[selectedRival].kills.name && p.kills === rivalStats.topPerformers.rivals[selectedRival].kills.value)
                          : m.team2Players.some(p => p.name === rivalStats.topPerformers.rivals[selectedRival].kills.name && p.kills === rivalStats.topPerformers.rivals[selectedRival].kills.value)
                        )
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
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival) &&
                        (m.team1 === selectedRival
                          ? m.team1Players.some(p => p.name === rivalStats.topPerformers.rivals[selectedRival].deaths.name && p.deaths === rivalStats.topPerformers.rivals[selectedRival].deaths.value)
                          : m.team2Players.some(p => p.name === rivalStats.topPerformers.rivals[selectedRival].deaths.name && p.deaths === rivalStats.topPerformers.rivals[selectedRival].deaths.value)
                        )
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
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival) &&
                        (m.team1 === selectedRival
                          ? m.team1Players.some(p => p.name === rivalStats.topPerformers.rivals[selectedRival].damage.name && p.damage === rivalStats.topPerformers.rivals[selectedRival].damage.value)
                          : m.team2Players.some(p => p.name === rivalStats.topPerformers.rivals[selectedRival].damage.name && p.damage === rivalStats.topPerformers.rivals[selectedRival].damage.value)
                        )
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
                        (m.team1 === 'Manifest' ? m.team2 === selectedRival : m.team1 === selectedRival) &&
                        (m.team1 === selectedRival
                          ? m.team1Players.some(p => p.name === rivalStats.topPerformers.rivals[selectedRival].debuffs.name && p.debuffs === rivalStats.topPerformers.rivals[selectedRival].debuffs.value)
                          : m.team2Players.some(p => p.name === rivalStats.topPerformers.rivals[selectedRival].debuffs.name && p.debuffs === rivalStats.topPerformers.rivals[selectedRival].debuffs.value)
                        )
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
                          <div className="flex justify-between items-center">
                            <span>{player.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPlayerMatchesModal(player.name);
                              }}
                              className="text-purple-400 hover:text-purple-300 text-sm underline"
                            >
                              Ver Partidas
                            </button>
                          </div>
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
                          <div className="flex justify-between items-center">
                            <span>{player.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPlayerMatchesModal(player.name);
                              }}
                              className="text-purple-400 hover:text-purple-300 text-sm underline"
                            >
                              Ver Partidas
                            </button>
                          </div>
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
                            <p className="text-sm text-gray-400">Matches Played</p>
                            <p className="text-2xl font-bold text-purple-400">
                              {rivalStats.playerStats.get(selectedManifestPlayer)?.matches || 0}
                            </p>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">K/D Ratio</p>
                            <p className="text-3xl font-bold text-purple-400">
                              {((rivalStats.playerStats.get(selectedManifestPlayer)?.kills || 0) / 
                                (rivalStats.playerStats.get(selectedManifestPlayer)?.deaths || 1)).toFixed(2)}
                            </p>
                            <div className="flex justify-center items-center gap-2 mt-2">
                              <div className="text-green-400 text-lg font-semibold">
                                {rivalStats.playerStats.get(selectedManifestPlayer)?.kills || 0}
                              </div>
                              <div className="text-gray-500">/</div>
                              <div className="text-red-400 text-lg font-semibold">
                                {rivalStats.playerStats.get(selectedManifestPlayer)?.deaths || 0}
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Avg Damage per Match</p>
                            <p className="text-2xl font-bold text-purple-400">
                              {Math.round((rivalStats.playerStats.get(selectedManifestPlayer)?.damage || 0) / 
                                (rivalStats.playerStats.get(selectedManifestPlayer)?.matches || 1)).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Total: {(rivalStats.playerStats.get(selectedManifestPlayer)?.damage || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Avg Damage Taken per Match</p>
                            <p className="text-2xl font-bold text-purple-400">
                              {Math.round((rivalStats.playerStats.get(selectedManifestPlayer)?.damageTaken || 0) / 
                                (rivalStats.playerStats.get(selectedManifestPlayer)?.matches || 1)).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Total: {(rivalStats.playerStats.get(selectedManifestPlayer)?.damageTaken || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Avg Debuffs per Match</p>
                            <p className="text-2xl font-bold text-purple-400">
                              {Math.round((rivalStats.playerStats.get(selectedManifestPlayer)?.debuffs || 0) / 
                                (rivalStats.playerStats.get(selectedManifestPlayer)?.matches || 1))}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Total: {rivalStats.playerStats.get(selectedManifestPlayer)?.debuffs || 0}
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
                            <p className="text-sm text-gray-400">Matches Played</p>
                            <p className="text-2xl font-bold text-purple-400">
                              {rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.matches || 0}
                            </p>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">K/D Ratio</p>
                            <p className="text-3xl font-bold text-purple-400">
                              {((rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.kills || 0) / 
                                (rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.deaths || 1)).toFixed(2)}
                            </p>
                            <div className="flex justify-center items-center gap-2 mt-2">
                              <div className="text-green-400 text-lg font-semibold">
                                {rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.kills || 0}
                              </div>
                              <div className="text-gray-500">/</div>
                              <div className="text-red-400 text-lg font-semibold">
                                {rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.deaths || 0}
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Avg Damage per Match</p>
                            <p className="text-2xl font-bold text-purple-400">
                              {Math.round((rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.damage || 0) / 
                                (rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.matches || 1)).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Total: {(rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.damage || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Avg Damage Taken per Match</p>
                            <p className="text-2xl font-bold text-purple-400">
                              {Math.round((rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.damageTaken || 0) / 
                                (rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.matches || 1)).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Total: {(rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.damageTaken || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-900 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Avg Debuffs per Match</p>
                            <p className="text-2xl font-bold text-purple-400">
                              {Math.round((rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.debuffs || 0) / 
                                (rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.matches || 1))}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Total: {rivalStats.rivalPlayerStats[selectedRival].get(selectedRivalPlayer)?.debuffs || 0}
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
                            <ManifestSortableHeader field="name" label="Player" />
                            <ManifestSortableHeader field="matches" label="Matches" />
                            <ManifestSortableHeader field="winRate" label="Win Rate" />
                            <ManifestSortableHeader field="kd" label="K/D" />
                            <ManifestSortableHeader field="kills" label="Kills" />
                            <ManifestSortableHeader field="deaths" label="Deaths" />
                            <ManifestSortableHeader field="debuffs" label="Debuffs" />
                            <ManifestSortableHeader field="damage" label="Damage" />
                            <ManifestSortableHeader field="damageTaken" label="Taken" />
                            <ManifestSortableHeader field="healing" label="Healing" />
                          </tr>
                        </thead>
                        <tbody>
                          {filteredManifestPlayers.map((player, index) => (
                            <tr key={player.name} className={index % 2 === 0 ? 'bg-gray-900' : ''}>
                              <td className="p-4 font-medium">
                                <button
                                  onClick={() => openPlayerMatchesModal(player.name)}
                                  className="text-purple-400 hover:text-purple-300 underline cursor-pointer"
                                >
                                  {player.name}
                                </button>
                              </td>
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
                            <RivalSortableHeader field="name" label="Player" />
                            <RivalSortableHeader field="matches" label="Matches" />
                            <RivalSortableHeader field="winRate" label="Win Rate" />
                            <RivalSortableHeader field="kd" label="K/D" />
                            <RivalSortableHeader field="kills" label="Kills" />
                            <RivalSortableHeader field="deaths" label="Deaths" />
                            <RivalSortableHeader field="debuffs" label="Debuffs" />
                            <RivalSortableHeader field="damage" label="Damage" />
                            <RivalSortableHeader field="damageTaken" label="Taken" />
                            <RivalSortableHeader field="healing" label="Healing" />
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRivalPlayers.map((player, index) => (
                            <tr key={player.name} className={index % 2 === 0 ? 'bg-gray-900' : ''}>
                              <td className="p-4 font-medium">
                                <button
                                  onClick={() => openPlayerMatchesModal(player.name)}
                                  className="text-purple-400 hover:text-purple-300 underline cursor-pointer"
                                >
                                  {player.name}
                                </button>
                              </td>
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

      {/* Modal de Partidas do Player */}
      {showPlayerMatchesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden transition-all duration-300 ${
            showMatchDetailsModal ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}>
            <div className="bg-gray-900 p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-purple-400">
                    Partidas de {selectedPlayerForModal} vs {selectedRival}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Clique em "Ver Detalhes da Partida" para ver estatísticas completas
                  </p>
                </div>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className={`p-6 overflow-y-auto max-h-[calc(90vh-120px)] ${
              showMatchDetailsModal ? 'pointer-events-none' : ''
            }`}>
              {(() => {
                const playerMatches = getPlayerMatches(selectedPlayerForModal);
                if (playerMatches.length === 0) {
                  return (
                    <div className="text-center text-gray-400 py-8">
                      Nenhuma partida encontrada para este player.
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    {playerMatches.map((match, index) => {
                      const isManifestPlayer = match.team1 === 'Manifest' 
                        ? match.team1Players.some(p => p.name === selectedPlayerForModal)
                        : match.team2Players.some(p => p.name === selectedPlayerForModal);
                      
                      const playerStats = match.team1 === 'Manifest'
                        ? (match.team1Players.find(p => p.name === selectedPlayerForModal) || 
                           match.team2Players.find(p => p.name === selectedPlayerForModal))
                        : (match.team2Players.find(p => p.name === selectedPlayerForModal) || 
                           match.team1Players.find(p => p.name === selectedPlayerForModal));
                      
                      const isVictory = (match.team1 === 'Manifest' && match.result === 'Victory') ||
                                       (match.team2 === 'Manifest' && match.result === 'Defeat');
                      
                      return (
                        <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center space-x-4">
                              <span className={`text-lg font-bold ${
                                isManifestPlayer 
                                  ? (isVictory ? 'text-green-400' : 'text-red-400')
                                  : (!isVictory ? 'text-green-400' : 'text-red-400')
                              }`}>
                                {isManifestPlayer 
                                  ? (isVictory ? 'Victory' : 'Defeat')
                                  : (!isVictory ? 'Victory' : 'Defeat')
                                }
                              </span>
                              <span className="text-gray-300">
                                {match.team1} vs {match.team2}
                              </span>
                            </div>
                            <span className="text-gray-400">{match.date}</span>
                          </div>
                          
                          {playerStats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                              <div className="text-center">
                                <div className="text-sm text-gray-400">K/D</div>
                                <div className="text-lg font-bold text-purple-400">
                                  {playerStats.kills}/{playerStats.deaths}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-400">Damage</div>
                                <div className="text-lg font-bold text-blue-400">
                                  {playerStats.damage.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-400">Debuffs</div>
                                <div className="text-lg font-bold text-yellow-400">
                                  {playerStats.debuffs}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-400">Healing</div>
                                <div className="text-lg font-bold text-green-400">
                                  {playerStats.healing.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <button
                            onClick={() => openMatchDetailsModal(match)}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                          >
                            Ver Detalhes da Partida
                          </button>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Partida */}
      {showMatchDetailsModal && selectedMatchForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gray-900 p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={goBackToPlayerMatches}
                    className="text-purple-400 hover:text-purple-300 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Voltar</span>
                  </button>
                  <h2 className="text-2xl font-bold text-purple-400">
                    Detalhes da Partida: {selectedMatchForModal.team1} vs {selectedMatchForModal.team2}
                  </h2>
                </div>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-400 mt-2">{selectedMatchForModal.date}</p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Team 1 */}
                <div className="bg-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-600 p-4">
                    <h3 className="text-xl font-bold text-green-400">
                      {selectedMatchForModal.team1} 
                      <span className="ml-2 text-sm text-gray-300">
                        [{selectedMatchForModal.team1 === 'Manifest' ? 'Guild Defender' : 'Rival'}]
                      </span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-600">
                        <tr>
                          <th className="text-left p-3">Player</th>
                          <th className="text-left p-3">K/D</th>
                          <th className="text-left p-3">Debuffs</th>
                          <th className="text-left p-3">Damage</th>
                          <th className="text-left p-3">Healing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMatchForModal.team1Players.map((player, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : ''}>
                            <td className="p-3 font-medium">{player.name}</td>
                            <td className="p-3">
                              {player.kills}/{player.deaths}
                              <span className="text-sm text-gray-400 ml-2">
                                ({player.deaths === 0 ? player.kills : (player.kills / player.deaths).toFixed(2)})
                              </span>
                            </td>
                            <td className="p-3">{player.debuffs}</td>
                            <td className="p-3">{player.damage.toLocaleString()}</td>
                            <td className="p-3">{player.healing.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Team 2 */}
                <div className="bg-gray-700 rounded-lg overflow-hidden">
                  <div className="bg-gray-600 p-4">
                    <h3 className="text-xl font-bold text-red-400">
                      {selectedMatchForModal.team2}
                      <span className="ml-2 text-sm text-gray-300">
                        [{selectedMatchForModal.team2 === 'Manifest' ? 'Guild Defender' : 'Rival'}]
                      </span>
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-600">
                        <tr>
                          <th className="text-left p-3">Player</th>
                          <th className="text-left p-3">K/D</th>
                          <th className="text-left p-3">Debuffs</th>
                          <th className="text-left p-3">Damage</th>
                          <th className="text-left p-3">Healing</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedMatchForModal.team2Players.map((player, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : ''}>
                            <td className="p-3 font-medium">{player.name}</td>
                            <td className="p-3">
                              {player.kills}/{player.deaths}
                              <span className="text-sm text-gray-400 ml-2">
                                ({player.deaths === 0 ? player.kills : (player.kills / player.deaths).toFixed(2)})
                              </span>
                            </td>
                            <td className="p-3">{player.debuffs}</td>
                            <td className="p-3">{player.damage.toLocaleString()}</td>
                            <td className="p-3">{player.healing.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function RivalStats() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white pt-16">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-2xl">Loading...</div>
          </div>
        </div>
      </div>
    }>
      <RivalStatsContent />
    </Suspense>
  );
}