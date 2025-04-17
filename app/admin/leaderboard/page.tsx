"use client";

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import AddMatchForm from '../../components/AddMatchForm';
import { Match } from '@/app/data/matches';

export default function AdminLeaderboard() {
  const [matches, setMatches] = React.useState<Match[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [editingMatch, setEditingMatch] = React.useState<Match | null>(null);
  const [deletingMatch, setDeletingMatch] = React.useState<Match | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatch = async (newMatch: Match) => {
    setMatches([newMatch, ...matches]);
    setEditingMatch(null);
  };

  const handleEditMatch = async (updatedMatch: Match) => {
    try {
      const response = await fetch('/api/matches', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMatch),
      });

      if (!response.ok) {
        throw new Error('Failed to update match');
      }

      const data = await response.json();
      setMatches(matches.map(match => 
        match._id === data._id ? data : match
      ));
      setEditingMatch(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update match');
    }
  };

  const handleDeleteMatch = async (match: Match) => {
    if (!match._id) return;
    
    try {
      const response = await fetch(`/api/matches?id=${match._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete match');
      }

      setMatches(matches.filter(m => m._id !== match._id));
      setDeletingMatch(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete match');
    }
  };

  // Delete confirmation dialog
  const DeleteConfirmationDialog = ({ match }: { match: Match }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete the match between {match.team1} and {match.team2} from {match.date}?
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setDeletingMatch(null)}
            className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteMatch(match)}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">
              {editingMatch ? 'Edit Match Result' : 'Add Match Result'}
            </h1>
            {editingMatch && (
              <button
                onClick={() => setEditingMatch(null)}
                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-8">
              {error}
            </div>
          )}

          <div className="mb-12">
            <AddMatchForm 
              onAddMatch={handleAddMatch} 
              onEditMatch={handleEditMatch}
              editingMatch={editingMatch}
            />
          </div>

          {loading ? (
            <div className="text-center">Loading matches...</div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
              {matches.map((match) => (
                <div
                  key={match._id}
                  className="bg-gray-800 p-6 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{match.team1} vs {match.team2}</h3>
                      <p className="text-gray-400">{match.date}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-xl">
                        <span className={match.result === 'Victory' ? 'text-green-500' : 'text-red-500'}>
                          {match.team1Score} - {match.team2Score}
                        </span>
                      </div>
                      <button
                        onClick={() => setEditingMatch(match)}
                        className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingMatch(match)}
                        className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {deletingMatch && <DeleteConfirmationDialog match={deletingMatch} />}
    </>
  );
} 