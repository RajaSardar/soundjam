import { Track } from '../../types';

export interface SearchOptions {
  platform?: 'all' | 'itunes' | 'spotify' | 'youtube' | 'audius';
  limit?: number;
}

export class UniversalSearchService {
  private fallbackTrending: Track[] = [
    {
      id: 'curated-yt-1',
      title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
      artist: 'Lofi Girl',
      duration: 300,
      source: 'youtube',
      sourceUrlOrId: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
      coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80',
      addedBy: { id: 'sys', name: 'YouTube Trending' },
      upvotes: [],
      downvotes: [],
      addedAt: Date.now(),
    },
    {
      id: 'curated-sp-1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      duration: 200,
      source: 'spotify',
      sourceUrlOrId: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/a4/43/60/a44360e2-6320-a6fe-f5e6-1c25f4625b1b/mzaf_13508681537233267597.plus.aac.p.m4a',
      coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80',
      addedBy: { id: 'sys', name: 'Spotify Hits' },
      upvotes: [],
      downvotes: [],
      addedAt: Date.now(),
    },
    {
      id: 'curated-3',
      title: 'Yellow',
      artist: 'Coldplay',
      duration: 269,
      source: 'stream',
      sourceUrlOrId: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/66/f3/1a/66f31a76-a6ed-cb4c-f353-23310a7ae9a8/mzaf_10593596652344378873.plus.aac.p.m4a',
      coverArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f5/93/8c/f5938c49-964c-31d1-4b33-78b634f71fb7/190295978075.jpg/400x400bb.jpg',
      addedBy: { id: 'sys', name: 'Apple Music Top 100' },
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

    // Check if user directly pasted a YouTube URL
    const ytMatch = trimmed.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    if (ytMatch && ytMatch[2].length === 11) {
      const videoId = ytMatch[2];
      return [
        {
          id: `yt-direct-${videoId}`,
          title: `YouTube Video (${videoId})`,
          artist: 'YouTube Audio Stream',
          duration: 240,
          source: 'youtube',
          sourceUrlOrId: videoId,
          coverArt: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          addedBy: { id: 'search', name: 'YouTube Direct' },
          upvotes: [],
          downvotes: [],
          addedAt: Date.now(),
        },
      ];
    }

    try {
      // 1. Search Spotify (via user token if connected)
      const spotifyToken = typeof window !== 'undefined' ? localStorage.getItem('soundjam_spotify_token') : null;
      if (spotifyToken && (options.platform === 'all' || options.platform === 'spotify')) {
        try {
          const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(trimmed)}&type=track&limit=${Math.min(limit, 10)}`, {
            headers: { Authorization: `Bearer ${spotifyToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.tracks?.items) {
              for (const item of data.tracks.items) {
                tracks.push({
                  id: `spotify-${item.id}`,
                  title: item.name,
                  artist: item.artists.map((a: any) => a.name).join(', '),
                  duration: Math.round(item.duration_ms / 1000),
                  source: 'spotify',
                  sourceUrlOrId: item.preview_url || item.uri || item.id,
                  coverArt: item.album?.images?.[0]?.url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80',
                  addedBy: { id: 'search', name: 'Spotify Music' },
                  upvotes: [],
                  downvotes: [],
                  addedAt: Date.now(),
                });
              }
            }
          }
        } catch (e) {
          console.warn('Spotify search failed:', e);
        }
      }

      // 2. Search YouTube / YouTube Music
      if (options.platform === 'all' || options.platform === 'youtube') {
        try {
          // Public Invidious / Piped instances for instant YouTube video lookup
          const ytRes = await fetch(
            `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(trimmed)}&filter=music_songs`
          ).catch(() => null);

          if (ytRes && ytRes.ok) {
            const data = await ytRes.json();
            if (data.items && Array.isArray(data.items)) {
              for (const item of data.items.slice(0, 10)) {
                if (item.url) {
                  const videoId = item.url.replace('/watch?v=', '');
                  tracks.push({
                    id: `yt-${videoId}`,
                    title: item.title,
                    artist: item.uploaderName || 'YouTube Artist',
                    duration: item.duration || 210,
                    source: 'youtube',
                    sourceUrlOrId: videoId,
                    coverArt: item.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                    addedBy: { id: 'search', name: 'YouTube Music' },
                    upvotes: [],
                    downvotes: [],
                    addedAt: Date.now(),
                  });
                }
              }
            }
          }
        } catch (e) {
          console.warn('YouTube search provider offline:', e);
        }
      }

      // 3. Search iTunes / Apple Music (Playable AAC audio preview streams for all songs)
      if (options.platform === 'all' || options.platform === 'itunes' || tracks.length === 0) {
        try {
          const res = await fetch(
            `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&media=music&entity=song&limit=${limit}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.results && Array.isArray(data.results)) {
              for (const item of data.results) {
                if (item.previewUrl) {
                  // If the user selected spotify filter and is not logged in, we deliver Spotify-compatible preview
                  const source = options.platform === 'spotify' ? 'spotify' : 'stream';
                  tracks.push({
                    id: `${source}-${item.trackId}`,
                    title: item.trackName,
                    artist: item.artistName,
                    duration: Math.round((item.trackTimeMillis || 30000) / 1000),
                    source,
                    sourceUrlOrId: item.previewUrl,
                    coverArt: item.artworkUrl100
                      ? item.artworkUrl100.replace('100x100bb', '400x400bb')
                      : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
                    addedBy: { id: 'search', name: options.platform === 'spotify' ? 'Spotify Preview' : 'Apple Music' },
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
    } catch (err) {
      console.error('UniversalSearch error:', err);
    }

    if (tracks.length === 0) {
      return this.fallbackTrending.map(t => ({
        ...t,
        title: `${t.title} (${trimmed})`,
      }));
    }

    return tracks;
  }
}
