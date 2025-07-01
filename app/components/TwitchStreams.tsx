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
  const [selectedStreamer, setSelectedStreamer] = useState<string>('lilly_x');
  const [vodId, setVodId] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<TwitchStream | null>(null);
  const [usersData, setUsersData] = useState<TwitchUser[]>([]);

  // Seleção automática: prioriza streamer ao vivo, senão VOD do primeiro da lista
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        setLoading(true);
        setError(null);
        setVodId(null);
        setSelectedStream(null);
        // Buscar os IDs dos usuários
        const userLogins = GUILD_STREAMERS.join('&user_login=');
        const usersResponse = await fetch(`/api/twitch/users?user_logins=${userLogins}`);
        const usersData = await usersResponse.json();
        setUsersData(usersData.data);
        const userIds = usersData.data.map((user: TwitchUser) => user.id);
        // Buscar as streams ativas desses usuários
        const userIdsParam = userIds.join('&user_id=');
        const streamsResponse = await fetch(`/api/twitch/streams?user_ids=${userIdsParam}`);
        const streamsData = await streamsResponse.json();
        setStreams(streamsData.data);
        // Seleção automática
        let autoStreamer = GUILD_STREAMERS[0];
        let liveStream = null;
        for (const streamer of GUILD_STREAMERS) {
          const found = streamsData.data.find((stream: TwitchStream) => stream.user_login.toLowerCase() === streamer.toLowerCase());
          if (found) {
            autoStreamer = streamer;
            liveStream = found;
            break;
          }
        }
        setSelectedStreamer(autoStreamer);
        if (liveStream) {
          setSelectedStream(liveStream);
        } else {
          // Buscar VOD do primeiro streamer da lista
          const user = usersData.data.find((user: TwitchUser) => user.login.toLowerCase() === autoStreamer.toLowerCase());
          if (user) {
            const vodRes = await fetch(`/api/twitch/videos?user_id=${user.id}`);
            if (vodRes.ok) {
              const vodData = await vodRes.json();
              if (vodData.data && vodData.data.length > 0) {
                setVodId(vodData.data[0].id);
              }
            }
          }
        }
      } catch (err) {
        setError('Failed to load streams');
      } finally {
        setLoading(false);
      }
    };
    fetchStreams();
    const interval = setInterval(fetchStreams, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Troca manual de streamer (discreta)
  const handleStreamerSelect = async (streamer: string) => {
    setSelectedStreamer(streamer);
    setSelectedStream(null);
    setVodId(null);
    // Verifica se está ao vivo
    const liveStream = streams.find((stream) => stream.user_login.toLowerCase() === streamer.toLowerCase());
    if (liveStream) {
      setSelectedStream(liveStream);
    } else {
      // Busca VOD
      const user = usersData.find((user) => user.login.toLowerCase() === streamer.toLowerCase());
      if (user) {
        const vodRes = await fetch(`/api/twitch/videos?user_id=${user.id}`);
        if (vodRes.ok) {
          const vodData = await vodRes.json();
          if (vodData.data && vodData.data.length > 0) {
            setVodId(vodData.data[0].id);
          }
        }
      }
    }
  };

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
          <div className="text-red-400 mb-2">⚠️</div>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Helper para nome amigável
  const getDisplayName = (login: string) => {
    if (login === 'lilly_x') return 'Toushiro';
    if (login === 'xizo_pardinho') return 'Xizo';
    if (login.toLowerCase().includes('muskiito')) return 'Skito';
    return login;
  };

  // Helper para status
  const isLive = streams.some((s) => s.user_login.toLowerCase() === selectedStreamer.toLowerCase());

  return (
    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md h-full min-h-[425px] flex flex-col justify-between">
      <h3 className="text-xl font-bold mb-4 text-purple-400 text-center">Streamers Ao Vivo</h3>
      {/* Player */}
      {selectedStream ? (
        <TwitchPlayer channel={selectedStreamer} width={400} height={225} parent="localhost" />
      ) : vodId ? (
        <TwitchPlayer video={vodId} width={400} height={225} parent="localhost" />
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📺</div>
          <p className="text-gray-400">Nenhum VOD encontrado para este streamer</p>
        </div>
      )}
      {/* Nome e status */}
      <div className="flex flex-col items-center justify-end flex-1 mt-3 mb-2">
        <span className="font-semibold text-lg text-white">
          {getDisplayName(selectedStreamer)}{' '}
          <span className={`text-xs font-bold ${isLive ? 'text-green-400' : 'text-red-400'}`}>{isLive ? 'ao vivo' : 'offline'}</span>
        </span>
        {/* Ícones circulares para trocar streamer */}
        <div className="flex justify-center gap-3 mt-3">
          {GUILD_STREAMERS.map((streamer) => (
            <button
              key={streamer}
              onClick={() => handleStreamerSelect(streamer)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all duration-200 focus:outline-none
                ${selectedStreamer === streamer ? 'bg-purple-600 text-white border-purple-400 scale-110' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-purple-700 hover:text-white'}`}
              title={getDisplayName(streamer)}
              style={{ cursor: 'pointer' }}
            >
              {getDisplayName(streamer)[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 