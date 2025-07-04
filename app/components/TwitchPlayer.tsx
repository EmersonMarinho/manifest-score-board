"use client";

import React from 'react';

interface TwitchPlayerProps {
  channel?: string;
  video?: string;
  width?: number;
  height?: number;
  parent?: string;
}

export default function TwitchPlayer({ 
  channel, 
  video,
  width = 400, 
  height = 225,
  parent 
}: TwitchPlayerProps) {
  const parentDomain = parent || (typeof window !== "undefined" ? window.location.hostname : "localhost");
  const src = video
    ? `https://player.twitch.tv/?video=${video}&parent=${parentDomain}`
    : `https://player.twitch.tv/?channel=${channel}&parent=${parentDomain}`;
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <iframe
        src={src}
        width={width}
        height={height}
        frameBorder="0"
        allowFullScreen
        title={video ? `Twitch VOD ${video}` : `${channel} Twitch Stream`}
        className="w-full"
      />
    </div>
  );
} 