import React, { useState, useEffect, useRef } from 'react';
import { Track, UserProfile } from '../types';
import { UniversalSearchService } from '../core/search/UniversalSearchService';
import { Search, Upload, Play, Plus, Loader2, Music2, Sparkles } from 'lucide-react';

interface UniversalSearchDrawerProps {
  currentUser: UserProfile;
  onAddTrack: (track: Track) => void;
  onPlayNow?: (track: Track) => void;
}

export const UniversalSearchDrawer: React.FC<UniversalSearchDrawerProps> = ({
  currentUser,
  onAddTrack,
  onPlayNow,
}) => {
  const [query, setQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'itunes' | 'audius'>('all');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchServiceRef = useRef<UniversalSearchService>(new UniversalSearchService());
  const debounceTimerRef = useRef<any>(null);

  // Quick genre suggestion chips
  const suggestionGenres = ['Pop', 'Lofi Beats', 'Electronic', 'Rock', 'Coldplay', 'Taylor Swift', 'Hip Hop', 'Jazz'];

  // Initial load: show trending tracks
  useEffect(() => {
    searchServiceRef.current.search('').then(tracks => {
      setResults(tracks);
    });
  }, []);

  const executeSearch = async (searchTerm: string, platform: 'all' | 'itunes' | 'audius') => {
    setIsLoading(true);
    try {
      const tracks = await searchServiceRef.current.search(searchTerm, {
        platform,
        limit: 25,
      });
      setResults(tracks);
    } catch (err) {
      console.warn('Search execution failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(val, selectedPlatform);
    }, 350);
  };

  const handlePlatformChange = (platform: 'all' | 'itunes' | 'audius') => {
    setSelectedPlatform(platform);
    executeSearch(query, platform);
  };

  const handleGenreChipClick = (genre: string) => {
    setQuery(genre);
    executeSearch(genre, selectedPlatform);
  };

  const handleAdd = (track: Track) => {
    const customized: Track = {
      ...track,
      id: `queue-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      addedBy: currentUser,
      upvotes: [currentUser.id],
      downvotes: [],
      addedAt: Date.now(),
    };
    onAddTrack(customized);
  };

  const handlePlayDirect = (track: Track) => {
    if (onPlayNow) {
      onPlayNow(track);
    } else {
      handleAdd(track);
    }
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
        coverArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop&q=80',
        addedBy: currentUser,
        upvotes: [currentUser.id],
        downvotes: [],
        addedAt: Date.now(),
      };
      onAddTrack(newTrack);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-purple-500/20 p-4 shadow-xl backdrop-blur-md flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Universal Multi-Platform Music Search</span>
        </h3>
        <span className="text-xs text-purple-400 flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Music Catalog</span>
        </span>
      </div>

      {/* Platform Filter Buttons */}
      <div className="flex items-center space-x-2 text-xs overflow-x-auto pb-1">
        <button
          onClick={() => handlePlatformChange('all')}
          className={`px-3 py-1 rounded-full font-medium transition ${
            selectedPlatform === 'all'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          All Platforms
        </button>
        <button
          onClick={() => handlePlatformChange('itunes')}
          className={`px-3 py-1 rounded-full font-medium transition ${
            selectedPlatform === 'itunes'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Apple / iTunes (100M+)
        </button>
        <button
          onClick={() => handlePlatformChange('audius')}
          className={`px-3 py-1 rounded-full font-medium transition ${
            selectedPlatform === 'audius'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Audius (Full Songs)
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Search any song, artist, album (e.g. Coldplay, Dua Lipa, Lofi, Rock)..."
          className="w-full bg-slate-950/80 border border-slate-700 focus:border-purple-500 rounded-xl px-4 py-2.5 pl-10 pr-28 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

        <div className="absolute right-2 top-2 flex items-center space-x-1.5">
          {isLoading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin mr-1" />}
          <label
            htmlFor="localAudioUpload"
            className="cursor-pointer px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-cyan-300 flex items-center space-x-1 transition"
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
      </div>

      {/* Suggested Genre Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] text-slate-400">
        <span className="flex-shrink-0 text-slate-500">Trending:</span>
        {suggestionGenres.map(genre => (
          <button
            key={genre}
            onClick={() => handleGenreChipClick(genre)}
            className="flex-shrink-0 px-2 py-0.5 rounded-md bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition border border-slate-700/50"
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Real Live Results List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {results.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>Searching music catalogs...</span>
              </div>
            ) : (
              'No music found. Try a different search term or genre!'
            )}
          </div>
        ) : (
          results.map(track => (
            <div
              key={track.id}
              className="group flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 hover:bg-purple-950/20 border border-slate-800/80 hover:border-purple-500/30 transition duration-150"
            >
              {/* Cover & Title */}
              <div className="flex items-center space-x-3 min-w-0 mr-2">
                <img
                  src={
                    track.coverArt ||
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={track.title}
                  className="w-10 h-10 rounded-lg object-cover border border-slate-800 flex-shrink-0 shadow-sm"
                />
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-bold text-white truncate">{track.title}</p>
                    <span className="text-[10px] px-1.5 py-0.2 rounded border bg-purple-500/10 text-purple-300 border-purple-500/30 font-semibold uppercase">
                      {track.id.startsWith('itunes') ? 'Apple' : track.id.startsWith('audius') ? 'Audius' : 'Stream'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {track.artist} &bull; {formatDuration(track.duration)}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Play Now & + Queue */}
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <button
                  onClick={() => handlePlayDirect(track)}
                  className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white transition text-xs font-medium flex items-center space-x-1"
                  title="Play directly now"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline text-[11px]">Play</span>
                </button>
                <button
                  onClick={() => handleAdd(track)}
                  className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition text-xs font-medium flex items-center space-x-1"
                  title="Add to collaborative queue"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Queue</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
