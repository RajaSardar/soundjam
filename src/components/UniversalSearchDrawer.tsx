import React, { useState, useEffect, useRef } from 'react';
import { Track, UserProfile } from '../types';
import { UniversalSearchService } from '../core/search/UniversalSearchService';
import { Search, Upload, Play, Plus, Loader2, Music2 } from 'lucide-react';

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
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'youtube' | 'spotify' | 'itunes'>('all');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchServiceRef = useRef<UniversalSearchService>(new UniversalSearchService());
  const debounceTimerRef = useRef<any>(null);

  const suggestionGenres = ['Coldplay', 'Lofi Beats', 'Taylor Swift', 'Dua Lipa', 'The Weeknd', 'Hip Hop', 'Rock'];

  useEffect(() => {
    searchServiceRef.current.search('').then(tracks => {
      setResults(tracks);
    });
  }, []);

  const executeSearch = async (searchTerm: string, platform: 'all' | 'youtube' | 'spotify' | 'itunes') => {
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

  const handlePlatformChange = (platform: 'all' | 'youtube' | 'spotify' | 'itunes') => {
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

  const getSourceBadge = (track: Track) => {
    if (track.source === 'youtube' || track.id.startsWith('yt')) {
      return { label: 'YouTube', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
    }
    if (track.source === 'spotify' || track.id.startsWith('spotify')) {
      return { label: 'Spotify', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
    }
    return { label: 'Apple', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
  };

  return (
    <div className="w-full flex flex-col space-y-3.5">
      {/* Header and Platform Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/60 border border-white/5">
          <button
            onClick={() => handlePlatformChange('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedPlatform === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Sources
          </button>
          <button
            onClick={() => handlePlatformChange('youtube')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
              selectedPlatform === 'youtube'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <span>YouTube</span>
          </button>
          <button
            onClick={() => handlePlatformChange('spotify')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
              selectedPlatform === 'spotify'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span>Spotify</span>
          </button>
          <button
            onClick={() => handlePlatformChange('itunes')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedPlatform === 'itunes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-indigo-400'
            }`}
          >
            Apple Music
          </button>
        </div>

        {/* Upload Local Track */}
        <label
          htmlFor="localAudioUpload"
          className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition"
          title="Upload Local Audio File"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span>Upload File</span>
          <input
            id="localAudioUpload"
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => handleQueryChange(e.target.value)}
          placeholder="Search song, artist, album, or paste YouTube link..."
          className="w-full bg-slate-900/80 border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 pl-11 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        {isLoading && (
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin absolute right-3.5 top-3.5" />
        )}
      </div>

      {/* Suggested Quick Genre Chips */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs text-slate-400">
        <span className="flex-shrink-0 text-slate-500">Quick:</span>
        {suggestionGenres.map(genre => (
          <button
            key={genre}
            onClick={() => handleGenreChipClick(genre)}
            className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-white/5"
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Search Results Tracklist */}
      <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
        {results.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            {isLoading ? 'Searching music catalog...' : 'No tracks found. Try searching for a different song or artist!'}
          </div>
        ) : (
          results.map(track => {
            const badge = getSourceBadge(track);
            return (
              <div
                key={track.id}
                className="group flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/5 hover:border-white/10 transition duration-150"
              >
                {/* Artwork & Info */}
                <div className="flex items-center space-x-3 min-w-0 mr-2 flex-1">
                  <img
                    src={
                      track.coverArt ||
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={track.title}
                    className="w-11 h-11 rounded-xl object-cover border border-white/10 flex-shrink-0 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">
                        {track.title}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md border font-medium uppercase ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {track.artist} &bull; {formatDuration(track.duration)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons: Play Now & Queue */}
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  <button
                    onClick={() => handlePlayDirect(track)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white transition text-xs font-semibold flex items-center space-x-1.5 border border-white/5"
                    title="Play track right now"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Play</span>
                  </button>

                  <button
                    onClick={() => handleAdd(track)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-purple-600/30"
                    title="Add to shared jam queue"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Queue</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
