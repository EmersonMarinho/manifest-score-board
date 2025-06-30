"use client";

import React, { useState, useEffect } from 'react';
import TwitchPlayer from './TwitchPlayer';

interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

// Lista de membros da guilda que fazem stream (você pode adicionar mais)
const GUILD_STREAMERS = [
    "lilly_x", // TOUSHIRO
    "xizo_pardinho",   // XIZO
    "SrMuskiito", // Skito
];

export default function TwitchStreams() {
  const [streams, setStreams] = useState<TwitchStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<TwitchStream | null>(null);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching streams for:', GUILD_STREAMERS);

        // Primeiro, buscar os IDs dos usuários
        const userLogins = GUILD_STREAMERS.join('&user_login=');
        const usersResponse = await fetch(`/api/twitch/users?user_logins=${userLogins}`);
        
        console.log('📡 Users API response status:', usersResponse.status);
        
        if (!usersResponse.ok) {
          if (usersResponse.status === 500) {
            // Credenciais não configuradas, mostrar fallback
            console.log('⚠️ Twitch credentials not configured');
            setStreams([]);
            setError('Twitch integration not configured');
            return;
          }
          throw new Error('Failed to fetch Twitch users');
        }

        const usersData = await usersResponse.json();
        console.log('👥 Found users:', usersData.data?.length || 0);
        
        const userIds = usersData.data.map((user: TwitchUser) => user.id);

        if (userIds.length === 0) {
          console.log('❌ No users found');
          setStreams([]);
          return;
        }

        // Depois, buscar as streams ativas desses usuários
        const userIdsParam = userIds.join('&user_id=');
        const streamsResponse = await fetch(`/api/twitch/streams?user_ids=${userIdsParam}`);
        
        console.log('📡 Streams API response status:', streamsResponse.status);
        
        if (!streamsResponse.ok) {
          throw new Error('Failed to fetch Twitch streams');
        }

        const streamsData = await streamsResponse.json();
        console.log('🎥 Found streams:', streamsData.data?.length || 0);
        
        setStreams(streamsData.data);
        
        // Selecionar a primeira stream automaticamente se houver
        if (streamsData.data.length > 0 && !selectedStream) {
          setSelectedStream(streamsData.data[0]);
          console.log('🎯 Selected stream:', streamsData.data[0].user_name);
        }
      } catch (err) {
        console.error('❌ Error fetching Twitch streams:', err);
        setError('Failed to load streams');
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchStreams, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [selectedStream]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-purple-400">Members Live Now</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          <span className="ml-3 text-gray-400">Loading streams...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-purple-400">Members Live Now</h3>
        <div className="text-center py-8">
          {error === 'Twitch integration not configured' ? (
            <>
              <div className="text-yellow-400 mb-2">⚙️</div>
              <p className="text-gray-400 mb-2">Twitch integration not configured</p>
              <p className="text-sm text-gray-500 mb-4">Check TWITCH_SETUP.md for instructions</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Known streamers:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {GUILD_STREAMERS.slice(0, 6).map((streamer) => (
                    <a
                      key={streamer}
                      href={`https://twitch.tv/${streamer}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
                    >
                      {streamer}
                    </a>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-red-400 mb-2">⚠️</div>
              <p className="text-gray-400">{error}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (streams.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4 text-purple-400">Members Live Now</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📺</div>
          <p className="text-gray-400">No members are currently streaming</p>
          <p className="text-sm text-gray-500 mt-2">Check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-purple-400">
        Members Live Now ({streams.length} streaming)
      </h3>
      
      {/* Twitch Player */}
      {selectedStream && (
        <div className="mb-6">
          <TwitchPlayer 
            channel={selectedStream.user_login} 
            width={400} 
            height={225}
            parent="localhost"
          />
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-400">
              Currently watching: <span className="text-purple-400 font-semibold">{selectedStream.user_name}</span>
            </p>
            <p className="text-xs text-gray-500">
              {streams.length > 1 ? `${streams.length} members live - click below to switch` : ''}
            </p>
          </div>
        </div>
      )}
      
      {/* Stream List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          All Live Streams ({streams.length})
        </h4>
        {streams.map((stream, index) => (
          <div 
            key={stream.id} 
            className={`bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer ${
              selectedStream?.id === stream.id ? 'ring-2 ring-purple-400 bg-gray-600' : ''
            }`}
            onClick={() => setSelectedStream(stream)}
          >
            <div className="flex items-start space-x-4">
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                <img
                  src={stream.thumbnail_url.replace('{width}', '120').replace('{height}', '68')}
                  alt={`${stream.user_name} stream`}
                  className="w-30 h-17 rounded-lg"
                />
                <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 rounded">
                  LIVE
                </div>
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                  {stream.viewer_count.toLocaleString()}
                </div>
                {selectedStream?.id === stream.id && (
                  <div className="absolute top-1 right-1 bg-purple-500 text-white text-xs px-1 rounded">
                    PLAYING
                  </div>
                )}
              </div>
              
              {/* Stream Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-white truncate">{stream.title}</h4>
                  <span className="text-xs text-gray-400">#{index + 1}</span>
                </div>
                <p className="text-purple-400 text-sm mb-1">{stream.user_name}</p>
                <p className="text-gray-400 text-sm mb-2">{stream.game_name}</p>
                <div className="flex items-center space-x-4">
                  <a
                    href={`https://twitch.tv/${stream.user_login}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Watch on Twitch
                  </a>
                  <span className="text-gray-400 text-sm">
                    {new Date(stream.started_at).toLocaleTimeString()}
                  </span>
                  <span className="text-green-400 text-sm">
                    {stream.viewer_count.toLocaleString()} viewers
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* View All Streams Button */}
      <div className="mt-6 text-center">
        <a
          href="https://twitch.tv/directory/game/Black%20Desert%20Online"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <span>📺</span>
          <span>View All BDO Streams</span>
        </a>
      </div>
    </div>
  );
} 