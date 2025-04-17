"use client";

import React from 'react';
import Navbar from '../components/Navbar';
import { Match } from '../data/matches';

type PlayerOverallStats = {
  name: string;
  matches: number;
  victories: number;
  defeats: number;
  winRate: number;
  kills: number;
  deaths: number;
  kd: number;
  debuffs: number;
  damage: number;
  damageTaken: number;
  healing: number;
  avgKills: number;
  avgDeaths: number;
  avgDebuffs: number;
  avgDamage: number;
  avgDamageTaken: number;
  avgHealing: number;
  bestKills: number;
  bestDamage: number;
  bestDebuffs: number;
  worstDeaths: number;
};

export default function Resume() {
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sortField, setSortField] = React.useState<keyof PlayerOverallStats>('matches');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

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
    } finally {
      setLoading(false);
    }
  };

  const calculatePlayerStats = React.useMemo(() => {
    const stats = new Map<string, PlayerOverallStats>();

    matches.forEach(match => {
      const isTeam1 = match.team1 === 'Manifest';
      const players = isTeam1 ? match.team1Players : match.team2Players;

      players.forEach(player => {
        const currentStats = stats.get(player.name) || {
          name: player.name,
          matches: 0,
          victories: 0,
          defeats: 0,
          winRate: 0,
          kills: 0,
          deaths: 0,
          kd: 0,
          debuffs: 0,
          damage: 0,
          damageTaken: 0,
          healing: 0,
          avgKills: 0,
          avgDeaths: 0,
          avgDebuffs: 0,
          avgDamage: 0,
          avgDamageTaken: 0,
          avgHealing: 0,
          bestKills: 0,
          bestDamage: 0,
          bestDebuffs: 0,
          worstDeaths: 0
        };

        // Update totals
        currentStats.matches += 1;
        currentStats.kills += player.kills;
        currentStats.deaths += player.deaths;
        currentStats.debuffs += player.debuffs;
        currentStats.damage += player.damage;
        currentStats.damageTaken += player.damageTaken;
        currentStats.healing += player.healing;

        // Update best/worst records
        currentStats.bestKills = Math.max(currentStats.bestKills, player.kills);
        currentStats.bestDamage = Math.max(currentStats.bestDamage, player.damage);
        currentStats.bestDebuffs = Math.max(currentStats.bestDebuffs, player.debuffs);
        currentStats.worstDeaths = Math.max(currentStats.worstDeaths, player.deaths);

        // Update win/loss
        if ((isTeam1 && match.result === 'Victory') || (!isTeam1 && match.result === 'Defeat')) {
          currentStats.victories += 1;
        } else {
          currentStats.defeats += 1;
        }

        // Calculate averages and rates
        currentStats.avgKills = currentStats.kills / currentStats.matches;
        currentStats.avgDeaths = currentStats.deaths / currentStats.matches;
        currentStats.avgDebuffs = currentStats.debuffs / currentStats.matches;
        currentStats.avgDamage = currentStats.damage / currentStats.matches;
        currentStats.avgDamageTaken = currentStats.damageTaken / currentStats.matches;
        currentStats.avgHealing = currentStats.healing / currentStats.matches;
        currentStats.winRate = (currentStats.victories / currentStats.matches) * 100;
        currentStats.kd = currentStats.deaths === 0 ? currentStats.kills : currentStats.kills / currentStats.deaths;

        stats.set(player.name, currentStats);
      });
    });

    return Array.from(stats.values());
  }, [matches]);

  const sortedStats = React.useMemo(() => {
    return [...calculatePlayerStats].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortOrder === 'desc' ? (bValue as number) - (aValue as number) : (aValue as number) - (bValue as number);
    });
  }, [calculatePlayerStats, sortField, sortOrder]);

  const handleSort = (field: keyof PlayerOverallStats) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortableHeader = ({ field, label }: { field: keyof PlayerOverallStats, label: string }) => (
    <th 
      className="p-4 text-left cursor-pointer hover:bg-gray-700"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortField === field && (
          <span className="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
        )}
      </div>
    </th>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-black text-white pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Loading statistics...</div>
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
          <h1 className="text-4xl font-bold mb-8">Manifest Performance Resume</h1>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <SortableHeader field="name" label="Player" />
                    <SortableHeader field="matches" label="Matches" />
                    <SortableHeader field="winRate" label="Win Rate" />
                    <SortableHeader field="kd" label="K/D" />
                    <SortableHeader field="kills" label="Total Kills" />
                    <SortableHeader field="avgKills" label="Avg Kills" />
                    <SortableHeader field="deaths" label="Total Deaths" />
                    <SortableHeader field="avgDeaths" label="Avg Deaths" />
                    <SortableHeader field="avgDebuffs" label="Avg CCs" />
                    <SortableHeader field="avgDamage" label="Avg Damage" />
                    <SortableHeader field="avgDamageTaken" label="Avg Taken" />
                    <SortableHeader field="avgHealing" label="Avg Healing" />
                    <SortableHeader field="bestKills" label="Best Kills" />
                    <SortableHeader field="bestDamage" label="Best Damage" />
                    <SortableHeader field="bestDebuffs" label="Best CCs" />
                    <SortableHeader field="worstDeaths" label="Most Deaths" />
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((player, index) => (
                    <tr key={player.name} className={index % 2 === 0 ? 'bg-gray-900' : ''}>
                      <td className="p-4 font-medium">{player.name}</td>
                      <td className="p-4">{player.matches}</td>
                      <td className="p-4">{player.winRate.toFixed(1)}%</td>
                      <td className="p-4">{player.kd.toFixed(2)}</td>
                      <td className="p-4">{player.kills}</td>
                      <td className="p-4">{player.avgKills.toFixed(1)}</td>
                      <td className="p-4">{player.deaths}</td>
                      <td className="p-4">{player.avgDeaths.toFixed(1)}</td>
                      <td className="p-4">{player.avgDebuffs.toFixed(1)}</td>
                      <td className="p-4">{Math.round(player.avgDamage).toLocaleString()}</td>
                      <td className="p-4">{Math.round(player.avgDamageTaken).toLocaleString()}</td>
                      <td className="p-4">{Math.round(player.avgHealing).toLocaleString()}</td>
                      <td className="p-4">{player.bestKills}</td>
                      <td className="p-4">{player.bestDamage.toLocaleString()}</td>
                      <td className="p-4">{player.bestDebuffs}</td>
                      <td className="p-4">{player.worstDeaths}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 