"use client";

import React from 'react';

interface TwitchPlayerProps {
  channel: string;
  width?: number;
  height?: number;
  parent?: string;
}

export default function TwitchPlayer({ 
  channel, 
  width = 400, 
  height = 225,
  parent = "localhost" 
}: TwitchPlayerProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <iframe
        src={`https://player.twitch.tv/?channel=${channel}&parent=${parent}`}
        width={width}
        height={height}
        frameBorder="0"
        allowFullScreen
        title={`${channel} Twitch Stream`}
        className="w-full"
      />
    </div>
  );
} 