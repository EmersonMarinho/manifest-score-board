"use client";

import React, { useState } from 'react';

export default function TwitchTest() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testTwitchAPI = async () => {
    setLoading(true);
    setTestResult('Testing...');

    try {
      // Testar API de usuários
      const usersResponse = await fetch('/api/twitch/users?user_logins=srmuskiito');
      const usersData = await usersResponse.json();
      
      if (!usersResponse.ok) {
        setTestResult(`❌ Users API Error: ${usersResponse.status} - ${usersData.error || 'Unknown error'}`);
        return;
      }

      if (!usersData.data || usersData.data.length === 0) {
        setTestResult('❌ User "srmuskiito" not found on Twitch');
        return;
      }

      const userId = usersData.data[0].id;
      setTestResult(`✅ User found: ${usersData.data[0].display_name} (ID: ${userId})`);

      // Testar API de streams
      const streamsResponse = await fetch(`/api/twitch/streams?user_ids=${userId}`);
      const streamsData = await streamsResponse.json();

      if (!streamsResponse.ok) {
        setTestResult(prev => `${prev}\n❌ Streams API Error: ${streamsResponse.status} - ${streamsData.error || 'Unknown error'}`);
        return;
      }

      if (streamsData.data && streamsData.data.length > 0) {
        const stream = streamsData.data[0];
        setTestResult(prev => `${prev}\n🎥 Stream found: "${stream.title}" (${stream.viewer_count} viewers)`);
      } else {
        setTestResult(prev => `${prev}\n📺 No active stream found for srmuskiito`);
      }

    } catch (error) {
      setTestResult(`❌ Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h4 className="text-lg font-bold mb-2 text-yellow-400">Twitch API Test</h4>
      <button
        onClick={testTwitchAPI}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-3 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Twitch API'}
      </button>
      {testResult && (
        <div className="bg-gray-700 p-3 rounded text-sm whitespace-pre-line">
          {testResult}
        </div>
      )}
    </div>
  );
} 