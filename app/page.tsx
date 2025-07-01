"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Match } from './data/matches';
import SpiderWebBackground from './components/SpiderWebBackground';
import TwitchStreams from './components/TwitchStreams';

const GUILD_STREAMERS = [
  "lilly_x",        // TOUSHIRO
  "xizo_pardinho",  // XIZO
  "srmuskiito",     // Skito (corrigido)
  // ...outros
];

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/matches');
        if (response.ok) {
          const data = await response.json();
          setMatches(data);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Calcular estatísticas
  const stats = {
    totalMatches: matches.length,
    victories: matches.filter(m => m.result === 'Victory').length,
    winRate: matches.length > 0 ? Math.round((matches.filter(m => m.result === 'Victory').length / matches.length) * 100) : 0,
    totalKills: matches.reduce((sum, match) => {
      const manifestPlayers = match.team1 === 'Manifest' ? match.team1Players : match.team2Players;
      return sum + manifestPlayers.reduce((playerSum, player) => playerSum + player.kills, 0);
    }, 0),
    totalDamage: matches.reduce((sum, match) => {
      const manifestPlayers = match.team1 === 'Manifest' ? match.team1Players : match.team2Players;
      return sum + manifestPlayers.reduce((playerSum, player) => playerSum + player.damage, 0);
    }, 0),
  };

  // Últimas vitórias
  const recentVictories = matches
    .filter(m => m.result === 'Victory')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Top performers
  const allPlayers = matches.flatMap(match => {
    const manifestPlayers = match.team1 === 'Manifest' ? match.team1Players : match.team2Players;
    return manifestPlayers.map(player => ({
      ...player,
      matchDate: match.date,
      opponent: match.team1 === 'Manifest' ? match.team2 : match.team1
    }));
  });

  const playerStats = allPlayers.reduce((acc, player) => {
    if (!acc[player.name]) {
      acc[player.name] = {
        name: player.name,
        totalKills: 0,
        totalDeaths: 0,
        totalDamage: 0,
        totalHealing: 0,
        totalDebuffs: 0,
        matches: 0
      };
    }
    acc[player.name].totalKills += player.kills;
    acc[player.name].totalDeaths += player.deaths;
    acc[player.name].totalDamage += player.damage;
    acc[player.name].totalHealing += player.healing;
    acc[player.name].totalDebuffs += player.debuffs;
    acc[player.name].matches += 1;
    return acc;
  }, {} as Record<string, any>);

  const topKillers = Object.values(playerStats)
    .sort((a, b) => b.totalKills - a.totalKills)
    .slice(0, 5);

  const topDamage = Object.values(playerStats)
    .sort((a, b) => b.totalDamage - a.totalDamage)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black overflow-hidden">
        <SpiderWebBackground />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            MANIFEST
          </h1>
          <p className="text-xl md:text-2xl mb-4 text-gray-300 max-w-2xl mx-auto">
            Black Desert Online
          </p>
          <p className="text-lg md:text-xl mb-8 text-purple-400 font-semibold">
            Junte-se a nós • Nossas conquistas
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
            <Link 
              href="/leaderboard"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Ver Leaderboard
            </Link>
            <Link 
              href="/recruitment"
              className="px-8 py-4 bg-transparent border-2 border-purple-600 hover:bg-purple-600 rounded-lg font-semibold transition-colors"
            >
              Junte-se a nós
            </Link>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">30</div>
              <div className="text-sm text-gray-400">Membros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">126</div>
              <div className="text-sm text-gray-400">Dec Kharazad</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">12</div>
              <div className="text-sm text-gray-400">Dec Weapons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">30</div>
              <div className="text-sm text-gray-400">Guru 50</div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Nossas conquistas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                {stats.totalMatches}
              </div>
              <div className="text-gray-400">Partidas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
                {stats.victories}
              </div>
              <div className="text-gray-400">Vitórias</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                {stats.winRate}%
              </div>
              <div className="text-gray-400">Win Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-red-400 mb-2">
                {stats.totalKills.toLocaleString()}
              </div>
              <div className="text-gray-400">Kills</div>
            </div>
          </div>
        </div>
      </section>

      {/* Members Live Now Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Nossos membros</h2>
          <div className="flex flex-col md:flex-row gap-12 justify-center items-start">
            <TwitchStreams />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8 w-full max-w-2xl">
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">30</div>
                <div className="text-gray-400">Membros</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">126</div>
                <div className="text-gray-400">Dec Kharazad</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">12</div>
                <div className="text-gray-400">Armas Dec</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">30</div>
                <div className="text-gray-400">Guru 50</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-red-400 mb-2">24/7</div>
                <div className="text-gray-400">Ativos</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-pink-400 mb-2">100%</div>
                <div className="text-gray-400">Dedicados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Victories */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Últimas vitórias</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {recentVictories.map((match, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-green-400">Vitória</h3>
                  <span className="text-gray-400">{match.date}</span>
                </div>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold mb-2">Manifest vs {match.team2}</div>
                  <div className="text-3xl font-bold text-purple-400">
                    {match.team1Score} - {match.team2Score}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {match.team1Players.length} players participated
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Performers */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Top Performance</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Top Killers */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-red-400">Top Killers</h3>
              <div className="space-y-4">
                {topKillers.map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-yellow-400 mr-4">#{index + 1}</span>
                      <div>
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-sm text-gray-400">{player.matches} matches</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-red-400">{player.totalKills}</div>
                      <div className="text-sm text-gray-400">kills</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Damage */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-orange-400">Top Dano</h3>
              <div className="space-y-4">
                {topDamage.map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-yellow-400 mr-4">#{index + 1}</span>
                      <div>
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-sm text-gray-400">{player.matches} matches</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-400">
                        {(player.totalDamage / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-400">damage</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para se juntar a nós?</h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Junte-se ao players com a melhor performance no Black Desert Online.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href="/recruitment"
              className="px-8 py-4 bg-white text-purple-900 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
            >
              Aplique agora
            </Link>
            <Link 
              href="/leaderboard"
              className="px-8 py-4 bg-transparent border-2 border-white hover:bg-white hover:text-purple-900 rounded-lg font-semibold transition-colors"
            >
              Ver Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Nossos patrocinadores</h2>
          <p className="text-xl text-center text-gray-400 mb-12">Orgulhosos de ser apoiados pelos melhores grindeiros do Black Desert Online</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
              <div className="text-4xl mb-4">⚔️</div>
              <div className="font-semibold"></div>
              <div className="text-sm text-gray-400"></div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
              <div className="text-4xl mb-4">🏆</div>
              <div className="font-semibold"></div>
              <div className="text-sm text-gray-400"></div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
              <div className="text-4xl mb-4">🎯</div>
              <div className="font-semibold"></div>
              <div className="text-sm text-gray-400"></div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
              <div className="text-4xl mb-4">🌟</div>
              <div className="font-semibold"></div>
              <div className="text-sm text-gray-400"></div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center hover:bg-gray-700 transition-colors">
              <div className="text-4xl mb-4">💎</div>
              <div className="font-semibold"></div>
              <div className="text-sm text-gray-400"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 