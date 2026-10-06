import React, { useState } from 'react';
import { Track, AudioSourceType, UserProfile } from '../types';
import { Search, Upload } from 'lucide-react';

interface UniversalSearchDrawerProps {
  currentUser: UserProfile;
  onAddTrack: (track: Track) => void;
}

export const UniversalSearchDrawer: React.FC<UniversalSearchDrawerProps> = ({
  currentUser,
  onAddTrack,
}) => {
  const [query, setQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [results, setResults] = useState<any[]>([]);

  const sampleSearchDb = [
    {
      title: 'Blinding Lights (After Hours VIP)',
      artist: 'The Weeknd',
      source: 'youtube',
      sourceName: 'YouTube',
      duration: 200,
      coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80',
    },
    {
      title: 'Levitating (Club Future Nostalgia)',
      artist: 'Dua Lipa',
      source: 'spotify',
      sourceName: 'Spotify',
      duration: 203,
      coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
    },
    {
      title: 'Midnight City (Sax Solo Session)',
      artist: 'M83',
      source: 'soundcloud',
      sourceName: 'SoundCloud',
      duration: 244,
      coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&auto=format&fit=crop&q=80',
    },
    {
      title: 'Electric Groove (Studio Master FLAC)',
      artist: 'SoundJam Collective',
      source: 'local',
      sourceName: 'Local Audio',
      duration: 195,
      coverArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const handleSearchChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }

    const matches = sampleSearchDb.filter(item => {
      const matchesSource = selectedSource === 'all' || item.source === selectedSource;
      const matchesText =
        item.title.toLowerCase().includes(val.toLowerCase()) ||
        item.artist.toLowerCase().includes(val.toLowerCase()) ||
        val.includes('http');
      return matchesSource && matchesText;
    });

    setResults(matches);
  };

  const handleQueueTrack = (item: any) => {
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      title: item.title,
      artist: item.artist,
      duration: item.duration || 210,
      source: item.source as AudioSourceType,
      sourceUrlOrId: item.sourceUrlOrId || `simulated-${item.source}`,
      coverArt: item.coverArt,
      addedBy: currentUser,
      upvotes: [currentUser.id],
      downvotes: [],
      addedAt: Date.now(),
    };

    onAddTrack(newTrack);
    setQuery('');
    setResults([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      const newTrack: Track = {
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Local File Upload',
        duration: 180,
        source: 'local',
        sourceUrlOrId: blobUrl,
        coverArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&auto=format&fit=crop&q=80',
        addedBy: currentUser,
        upvotes: [currentUser.id],
        downvotes: [],
        addedAt: Date.now(),
      };
      onAddTrack(newTrack);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-purple-500/20 p-4 shadow-xl backdrop-blur-md">
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between">
        <span className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Universal Search & Add to Queue</span>
        </span>
        <span className="text-xs normal-case font-normal text-purple-400">
          Search 4+ sources at once
        </span>
      </h3>

      {/* Source Filter Badges */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs">
        {['all', 'youtube', 'spotify', 'soundcloud', 'local', 'stream'].map(source => (
          <button
            key={source}
            onClick={() => setSelectedSource(source)}
            className={`px-3 py-1 rounded-full capitalize font-medium transition ${
              selectedSource === source
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {source === 'all' ? 'All Sources' : source}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative mt-2">
        <input
          type="text"
          value={query}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder="Paste YouTube link, Spotify track, or search song title..."
          className="w-full bg-slate-950/80 border border-slate-700 focus:border-purple-500 rounded-xl px-4 py-2.5 pl-10 pr-24 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

        <label
          htmlFor="localAudioUpload"
          className="cursor-pointer absolute right-2 top-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-cyan-300 flex items-center space-x-1"
          title="Upload Local File"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload</span>
          <input
            id="localAudioUpload"
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Dropdown Results */}
      {query && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
          {results.length > 0 ? (
            results.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 hover:bg-purple-900/20 border border-slate-800 transition"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {item.artist} &bull; <span className="text-purple-400">{item.sourceName}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleQueueTrack(item)}
                  className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                >
                  + Queue
                </button>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-xs text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800">
              No direct library match.
              <button
                onClick={() =>
                  handleQueueTrack({
                    title: query,
                    artist: 'Web Stream / YouTube',
                    source: 'youtube',
                    sourceName: 'YouTube',
                    duration: 210,
                  })
                }
                className="ml-2 text-cyan-400 underline font-semibold"
              >
                Queue as Web Stream
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
