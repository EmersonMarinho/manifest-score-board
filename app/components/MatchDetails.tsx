import React from 'react';
import { Match } from '../data/matches';

type MatchDetailsProps = {
  match: Match;
  onBack: () => void;
};

export default function MatchDetails({ match, onBack }: MatchDetailsProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-purple-500 hover:text-purple-400 mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            BACK TO MATCHES
          </button>
          <h1 className="text-3xl font-bold">
            {match.date} - {match.result} vs {match.team2}
          </h1>
        </div>

        {/* Match Tables */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Team 1 */}
          <div className="bg-purple-900 rounded-lg overflow-hidden">
            <div className="bg-purple-800 p-4">
              <h2 className="text-xl font-bold text-green-400">
                [Defender Unit I] [{match.result}] {match.team1}
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
                  {match.team1Players.map((player, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-purple-950' : ''}>
                      <td className="p-4 font-medium">{player.name}</td>
                      <td className="p-4">{player.kills}/{player.deaths}</td>
                      <td className="p-4">{player.debuffs}</td>
                      <td className="p-4">{player.damage.toLocaleString()}</td>
                      <td className="p-4">{(player.damage * 0.2).toLocaleString()}</td>
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
                [Defender Unit I] [{match.result === 'Victory' ? 'Defeat' : 'Victory'}] {match.team2}
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
                  {match.team2Players.map((player, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-purple-950' : ''}>
                      <td className="p-4 font-medium">{player.name}</td>
                      <td className="p-4">{player.kills}/{player.deaths}</td>
                      <td className="p-4">{player.debuffs}</td>
                      <td className="p-4">{player.damage.toLocaleString()}</td>
                      <td className="p-4">{(player.damage * 0.2).toLocaleString()}</td>
                      <td className="p-4">{player.healing.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 