import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniversalSearchService } from './UniversalSearchService';

describe('UniversalSearchService (Multi-Platform Music Search)', () => {
  let searchService: UniversalSearchService;

  beforeEach(() => {
    searchService = new UniversalSearchService();
  });

  it('should return trending tracks when query is empty', async () => {
    const results = await searchService.search('');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('title');
    expect(results[0]).toHaveProperty('artist');
    expect(results[0]).toHaveProperty('sourceUrlOrId');
    expect(results[0].sourceUrlOrId).toMatch(/^https?:\/\//);
  });

  it('should correctly map iTunes search results to Track interface', async () => {
    // Mock fetch for iTunes API
    const mockItunesResponse = {
      resultCount: 1,
      results: [
        {
          trackId: 12345,
          trackName: 'Viva La Vida',
          artistName: 'Coldplay',
          trackTimeMillis: 242000,
          previewUrl: 'https://audio.example.com/vivalavida.m4a',
          artworkUrl100: 'https://images.example.com/100x100bb.jpg',
        },
      ],
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('itunes.apple.com')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItunesResponse),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });
    });

    const results = await searchService.search('coldplay');
    expect(results.length).toBeGreaterThan(0);
    const track = results.find(t => t.title === 'Viva La Vida');
    expect(track).toBeDefined();
    expect(track?.artist).toBe('Coldplay');
    expect(track?.duration).toBe(242);
    expect(track?.sourceUrlOrId).toBe('https://audio.example.com/vivalavida.m4a');
    expect(track?.coverArt).toContain('400x400bb.jpg');
  });

  it('should gracefully handle API failure without throwing exceptions', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const results = await searchService.search('offline search');
    // Should return fallback tracks rather than crashing
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });
});
