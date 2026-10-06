import { Track, AudioSourceType } from '../../types';

export interface SearchOptions {
  platform?: 'all' | 'itunes' | 'audius' | 'youtube';
  limit?: number;
}

export class UniversalSearchService {
  private fallbackTrending: Track[] = [
    {
      id: 'curated-1',
      title: 'Kangaroo MusiQue (RPG Groove)',
      artist: 'DDR Classics',
      duration: 125,
      source: 'stream',
      sourceUrlOrId: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
      coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80',
      addedBy: { id: 'sys', name: 'SoundJam Trending' },
      upvotes: [],
      downvotes: [],
      addedAt: Date.now(),
    },
    {
      id: 'curated-2',
      title: 'Coffee House Ambient Session',
      artist: 'Google Audio Labs',
      duration: 140,
      source: 'stream',
      sourceUrlOrId: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
      coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      addedBy: { id: 'sys', name: 'SoundJam Trending' },
      upvotes: [],
      downvotes: [],
      addedAt: Date.now(),
    },
    {
      id: 'curated-3',
      title: 'Synthwave Night Ride',
      artist: 'Retro Dreamer',
      duration: 210,
      source: 'stream',
      sourceUrlOrId: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
      coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
      addedBy: { id: 'sys', name: 'SoundJam Trending' },
      upvotes: [],
      downvotes: [],
      addedAt: Date.now(),
    },
  ];

  public async search(query: string, options: SearchOptions = {}): Promise<Track[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return this.fallbackTrending;
    }

    const limit = options.limit || 20;
    const tracks: Track[] = [];

    try {
      // 1. Search iTunes / Apple Music (Real playable AAC/M4A streams)
      if (!options.platform || options.platform === 'all' || options.platform === 'itunes') {
        try {
          const res = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&media=music&entity=song&limit=${limit}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.results && Array.isArray(data.results)) {
              for (const item of data.results) {
                if (item.previewUrl) {
                  tracks.push({
                    id: `itunes-${item.trackId}`,
                    title: item.trackName,
                    artist: item.artistName,
                    duration: Math.round((item.trackTimeMillis || 30000) / 1000),
                    source: 'stream',
                    sourceUrlOrId: item.previewUrl,
                    coverArt: item.artworkUrl100
                      ? item.artworkUrl100.replace('100x100bb', '400x400bb')
                      : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
                    addedBy: { id: 'search', name: 'Search Result' },
                    upvotes: [],
                    downvotes: [],
                    addedAt: Date.now(),
                  });
                }
              }
            }
          }
        } catch (e) {
          console.warn('iTunes search failed or offline:', e);
        }
      }

      // 2. Search Audius (Full length tracks)
      if (!options.platform || options.platform === 'all' || options.platform === 'audius') {
        try {
          const res = await fetch(
            `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(trimmed)}&app_name=SoundJam`
          );
          if (res.ok) {
            const json = await res.json();
            if (json.data && Array.isArray(json.data)) {
              for (const item of json.data.slice(0, 10)) {
                const streamUrl =
                  item.stream?.url ||
                  item.preview?.url ||
                  `https://discoveryprovider.audius.co/v1/tracks/${item.id}/stream?app_name=SoundJam`;
                const art =
                  item.artwork?.['480x480'] ||
                  item.artwork?.['150x150'] ||
                  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80';

                tracks.push({
                  id: `audius-${item.id}`,
                  title: item.title,
                  artist: item.user?.name || 'Audius Artist',
                  duration: item.duration || 180,
                  source: 'stream',
                  sourceUrlOrId: streamUrl,
                  coverArt: art,
                  addedBy: { id: 'search', name: 'Audius Music' },
                  upvotes: [],
                  downvotes: [],
                  addedAt: Date.now(),
                });
              }
            }
          }
        } catch (e) {
          console.warn('Audius search failed or offline:', e);
        }
      }
    } catch (err) {
      console.error('UniversalSearch error:', err);
    }

    if (tracks.length === 0) {
      // Fallback matching query locally
      return this.fallbackTrending.map(t => ({
        ...t,
        title: `${t.title} (${trimmed})`,
      }));
    }

    return tracks;
  }
}
