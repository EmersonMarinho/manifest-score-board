"use client";

import React, { useState, useEffect } from 'react';
import { Match } from '../data/matches';

interface AddMatchFormProps {
  onAddMatch: (match: Match) => void;
  onEditMatch: (match: Match) => void;
  editingMatch: Match | null;
}

export default function AddMatchForm({ onAddMatch, onEditMatch, editingMatch }: AddMatchFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [team1FirstBlood, setTeam1FirstBlood] = useState(false);
  const [team2FirstBlood, setTeam2FirstBlood] = useState(false);
  const [team1TotalKills, setTeam1TotalKills] = useState(0);
  const [team2TotalKills, setTeam2TotalKills] = useState(0);

  // Função para calcular o total de pontos de uma equipe
  const calculateTeamScore = (teamNumber: 1 | 2, fb1 = team1FirstBlood, fb2 = team2FirstBlood) => {
    const form = document.querySelector('form');
    if (!form) return 0;

    let total = 0;
    
    if (teamNumber === 1) {
      // Kills da equipe 1 (10 pontos cada)
      for (let i = 1; i <= 10; i++) {
        const killsInput = form.querySelector(`[name="kills${i}"]`) as HTMLInputElement;
        if (killsInput && killsInput.value) {
          total += (parseInt(killsInput.value) || 0) * 10;
        }
      }
      // First Blood da equipe 1 (40 pontos)
      if (fb1) {
        total += 40;
      }
    } else {
      // Kills da equipe 2 (10 pontos cada)
      for (let i = 1; i <= 10; i++) {
        const killsInput = form.querySelector(`[name="opponentKills${i}"]`) as HTMLInputElement;
        if (killsInput && killsInput.value) {
          total += (parseInt(killsInput.value) || 0) * 10;
        }
      }
      // First Blood da equipe 2 (40 pontos)
      if (fb2) {
        total += 40;
      }
    }
    return Math.min(total, 1000);
  };

  // Atualizar totais quando os inputs mudarem
  const handleScoreChange = () => {
    setTeam1TotalKills(calculateTeamScore(1));
    setTeam2TotalKills(calculateTeamScore(2));
  };

  // Atualizar totais quando o firstblood mudar (radio)
  const handleFirstBloodRadio = (team: 1 | 2) => {
    let newTeam1FirstBlood = team1FirstBlood;
    let newTeam2FirstBlood = team2FirstBlood;
    if (team === 1) {
      if (team1FirstBlood) {
        newTeam1FirstBlood = false;
      } else {
        newTeam1FirstBlood = true;
        newTeam2FirstBlood = false;
      }
    } else {
      if (team2FirstBlood) {
        newTeam2FirstBlood = false;
      } else {
        newTeam2FirstBlood = true;
        newTeam1FirstBlood = false;
      }
    }
    setTeam1FirstBlood(newTeam1FirstBlood);
    setTeam2FirstBlood(newTeam2FirstBlood);
    setTimeout(() => {
      setTeam1TotalKills(calculateTeamScore(1, newTeam1FirstBlood, newTeam2FirstBlood));
      setTeam2TotalKills(calculateTeamScore(2, newTeam1FirstBlood, newTeam2FirstBlood));
    }, 0);
  };

  // Inicializar totais quando o componente montar
  useEffect(() => {
    setTimeout(() => {
      setTeam1TotalKills(calculateTeamScore(1));
      setTeam2TotalKills(calculateTeamScore(2));
    }, 0);
  }, []);

  // Reset form when editingMatch changes
  useEffect(() => {
    if (editingMatch) {
      const form = document.querySelector('form');
      if (form) {
        // Set match details
        (form.querySelector('[name="date"]') as HTMLInputElement).value = editingMatch.date;
        (form.querySelector('[name="opponent"]') as HTMLInputElement).value = editingMatch.team2;
        (form.querySelector('[name="result"]') as HTMLSelectElement).value = editingMatch.result;
        (form.querySelector('[name="team1Score"]') as HTMLInputElement).value = editingMatch.team1Score.toString();
        (form.querySelector('[name="team2Score"]') as HTMLInputElement).value = editingMatch.team2Score.toString();

        // Set team 1 players
        editingMatch.team1Players.forEach((player, index) => {
          (form.querySelector(`[name="player${index + 1}"]`) as HTMLInputElement).value = player.name;
          (form.querySelector(`[name="kills${index + 1}"]`) as HTMLInputElement).value = player.kills.toString();
          (form.querySelector(`[name="deaths${index + 1}"]`) as HTMLInputElement).value = player.deaths.toString();
          (form.querySelector(`[name="debuffs${index + 1}"]`) as HTMLInputElement).value = player.debuffs.toString();
          (form.querySelector(`[name="damage${index + 1}"]`) as HTMLInputElement).value = player.damage.toString();
          (form.querySelector(`[name="damageTaken${index + 1}"]`) as HTMLInputElement).value = player.damageTaken.toString();
          (form.querySelector(`[name="healing${index + 1}"]`) as HTMLInputElement).value = player.healing.toString();
        });

        // Set team 2 players
        editingMatch.team2Players.forEach((player, index) => {
          (form.querySelector(`[name="opponent${index + 1}"]`) as HTMLInputElement).value = player.name;
          (form.querySelector(`[name="opponentKills${index + 1}"]`) as HTMLInputElement).value = player.kills.toString();
          (form.querySelector(`[name="opponentDeaths${index + 1}"]`) as HTMLInputElement).value = player.deaths.toString();
          (form.querySelector(`[name="opponentDebuffs${index + 1}"]`) as HTMLInputElement).value = player.debuffs.toString();
          (form.querySelector(`[name="opponentDamage${index + 1}"]`) as HTMLInputElement).value = player.damage.toString();
          (form.querySelector(`[name="opponentDamageTaken${index + 1}"]`) as HTMLInputElement).value = player.damageTaken.toString();
          (form.querySelector(`[name="opponentHealing${index + 1}"]`) as HTMLInputElement).value = player.healing.toString();
        });

        // Recalcular totais após carregar os dados
        setTimeout(() => {
          setTeam1TotalKills(calculateTeamScore(1));
          setTeam2TotalKills(calculateTeamScore(2));
        }, 0);
      }
    }
  }, [editingMatch]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const matchData = {
      ...(editingMatch?._id ? { _id: editingMatch._id } : {}),
      date: formData.get('date') as string,
      team1: 'Manifest',
      team2: formData.get('opponent') as string,
      result: formData.get('result') as 'Victory' | 'Defeat',
      team1Score: team1TotalKills,
      team2Score: team2TotalKills,
      team1FirstBlood,
      team2FirstBlood,
      team1Players: Array.from({ length: 10 }, (_, i) => ({
        name: formData.get(`player${i + 1}`) as string || '',
        kills: parseInt(formData.get(`kills${i + 1}`) as string || '0'),
        deaths: parseInt(formData.get(`deaths${i + 1}`) as string || '0'),
        debuffs: parseInt(formData.get(`debuffs${i + 1}`) as string || '0'),
        damage: parseInt(formData.get(`damage${i + 1}`) as string || '0'),
        damageTaken: parseInt(formData.get(`damageTaken${i + 1}`) as string || '0'),
        healing: parseInt(formData.get(`healing${i + 1}`) as string || '0'),
      })).filter(player => player.name),
      team2Players: Array.from({ length: 10 }, (_, i) => ({
        name: formData.get(`opponent${i + 1}`) as string || '',
        kills: parseInt(formData.get(`opponentKills${i + 1}`) as string || '0'),
        deaths: parseInt(formData.get(`opponentDeaths${i + 1}`) as string || '0'),
        debuffs: parseInt(formData.get(`opponentDebuffs${i + 1}`) as string || '0'),
        damage: parseInt(formData.get(`opponentDamage${i + 1}`) as string || '0'),
        damageTaken: parseInt(formData.get(`opponentDamageTaken${i + 1}`) as string || '0'),
        healing: parseInt(formData.get(`opponentHealing${i + 1}`) as string || '0'),
      })).filter(player => player.name),
    };

    try {
      const response = await fetch('/api/matches', {
        method: editingMatch ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to save match');
      }

      const savedMatch = await response.json();
      
      if (editingMatch) {
        await onEditMatch(savedMatch);
        setMessage('Match updated successfully!');
      } else {
        await onAddMatch(savedMatch);
        setMessage('Match added successfully!');
        // Reset form fields
        const inputs = form.querySelectorAll('input');
        inputs.forEach((input: HTMLInputElement) => {
          if (input.type === 'number') {
            input.value = '0';
          } else if (input.type === 'text') {
            input.value = '';
          }
        });
        // Reset date to today
        const dateInput = form.querySelector('[name="date"]') as HTMLInputElement;
        if (dateInput) {
          dateInput.value = new Date().toISOString().split('T')[0];
        }
        // Reset select to default
        const resultSelect = form.querySelector('[name="result"]') as HTMLSelectElement;
        if (resultSelect) {
          resultSelect.value = 'Victory';
        }
      }
      
      setMessageType('success');
    } catch (error) {
      console.error('Error saving match:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to save match. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${
          messageType === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold mb-4">Match Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Match Date</label>
              <input
                type="date"
                name="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-800 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Opponent Guild</label>
              <input
                type="text"
                name="opponent"
                required
                className="w-full bg-gray-800 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Result</label>
              <select
                name="result"
                required
                className="w-full bg-gray-800 rounded px-3 py-2"
              >
                <option value="Victory">Victory</option>
                <option value="Defeat">Defeat</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Our Score</label>
                <div className="text-2xl font-bold text-purple-500">{team1TotalKills}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Their Score</label>
                <div className="text-2xl font-bold text-purple-500">{team2TotalKills}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="team1FirstBlood"
                  name="firstBlood"
                  checked={team1FirstBlood}
                  onChange={() => handleFirstBloodRadio(1)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="team1FirstBlood" className="text-sm font-medium">
                  Our First Blood (+40)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="team2FirstBlood"
                  name="firstBlood"
                  checked={team2FirstBlood}
                  onChange={() => handleFirstBloodRadio(2)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="team2FirstBlood" className="text-sm font-medium">
                  Their First Blood (+40)
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Our Players</h3>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    name={`player${i + 1}`}
                    placeholder="Player name"
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`kills${i + 1}`}
                    placeholder="K"
                    min="0"
                    onChange={handleScoreChange}
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`deaths${i + 1}`}
                    placeholder="D"
                    min="0"
                    onChange={handleScoreChange}
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`debuffs${i + 1}`}
                    placeholder="CC"
                    min="0"
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`damage${i + 1}`}
                    placeholder="DMG"
                    min="0"
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`damageTaken${i + 1}`}
                    placeholder="TAKEN"
                    min="0"
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`healing${i + 1}`}
                    placeholder="HEAL"
                    min="0"
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Opponent Players</h3>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid grid-cols-8 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    name={`opponent${i + 1}`}
                    placeholder="Player name"
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`opponentKills${i + 1}`}
                    placeholder="K"
                    min="0"
                    onChange={handleScoreChange}
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`opponentDeaths${i + 1}`}
                    placeholder="D"
                    min="0"
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`opponentDebuffs${i + 1}`}
                    placeholder="CC"
                    min="0"
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`opponentDamage${i + 1}`}
                    placeholder="DMG"
                    min="0"
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`opponentDamageTaken${i + 1}`}
                    placeholder="TAKEN"
                    min="0"
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name={`opponentHealing${i + 1}`}
                    placeholder="HEAL"
                    min="0"
                    className="w-full bg-gray-800 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : editingMatch ? 'Update Match' : 'Add Match'}
        </button>
      </div>
    </form>
  );
} 