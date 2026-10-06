import { describe, it, expect, beforeEach } from 'vitest';
import { UniversalQueue } from './UniversalQueue';
import { Track } from '../../types';

describe('UniversalQueue (Collaborative Queue & Democratic Voting)', () => {
  let queue: UniversalQueue;

  const mockTrack1: Track = {
    id: 'yt-1',
    title: 'Starboy',
    artist: 'The Weeknd',
    duration: 230,
    source: 'youtube',
    sourceUrlOrId: 'dQw4w9WgXcQ',
    addedBy: { id: 'user-1', name: 'Alex' },
    upvotes: [],
    downvotes: [],
    addedAt: 1000,
  };

  const mockTrack2: Track = {
    id: 'sp-2',
    title: 'Get Lucky',
    artist: 'Daft Punk',
    duration: 245,
    source: 'spotify',
    sourceUrlOrId: 'spotify:track:123',
    addedBy: { id: 'user-2', name: 'DJ Diesel' },
    upvotes: [],
    downvotes: [],
    addedAt: 2000,
  };

  const mockTrack3: Track = {
    id: 'loc-3',
    title: 'Garage Jam FLAC',
    artist: 'Jax',
    duration: 180,
    source: 'local',
    sourceUrlOrId: 'blob:http://localhost/local-audio',
    addedBy: { id: 'user-3', name: 'Jax' },
    upvotes: [],
    downvotes: [],
    addedAt: 3000,
  };

  beforeEach(() => {
    queue = new UniversalQueue();
  });

  it('should add tracks from mixed sources into the queue', () => {
    queue.addTrack(mockTrack1);
    queue.addTrack(mockTrack2);
    queue.addTrack(mockTrack3);

    expect(queue.getTracks().length).toBe(3);
    expect(queue.getTracks()[0].source).toBe('youtube');
    expect(queue.getTracks()[1].source).toBe('spotify');
    expect(queue.getTracks()[2].source).toBe('local');
  });

  it('should dynamically promote track to the top when it receives more upvotes', () => {
    queue.addTrack(mockTrack1); // added first (index 0)
    queue.addTrack(mockTrack2); // added second (index 1)
    queue.addTrack(mockTrack3); // added third (index 2)

    // Initially track 1 is first
    expect(queue.getTracks()[0].id).toBe('yt-1');

    // User 1, 2, and 4 upvote track 3
    queue.vote(mockTrack3.id, 'user-1', 'up');
    queue.vote(mockTrack3.id, 'user-2', 'up');
    queue.vote(mockTrack3.id, 'user-4', 'up');

    // Track 3 should now be #1 in queue
    expect(queue.getTracks()[0].id).toBe('loc-3');
    expect(queue.getTracks()[0].upvotes.length).toBe(3);
  });

  it('should demote track when downvoted', () => {
    queue.addTrack(mockTrack1);
    queue.addTrack(mockTrack2);

    queue.vote(mockTrack1.id, 'user-1', 'down');
    queue.vote(mockTrack1.id, 'user-2', 'down');

    // Track 2 has 0 votes, Track 1 has -2 votes => Track 2 is top
    expect(queue.getTracks()[0].id).toBe('sp-2');
  });

  it('should toggle vote off when clicked twice by same user', () => {
    queue.addTrack(mockTrack1);
    queue.vote(mockTrack1.id, 'user-1', 'up');
    expect(queue.getTracks()[0].upvotes).toContain('user-1');

    // Clicking upvote again toggles it off
    queue.vote(mockTrack1.id, 'user-1', 'up');
    expect(queue.getTracks()[0].upvotes).not.toContain('user-1');
  });

  it('should pop the next track and archive to history', () => {
    queue.addTrack(mockTrack1);
    queue.addTrack(mockTrack2);

    const next = queue.popNextTrack();
    expect(next?.id).toBe('yt-1');
    expect(queue.getTracks().length).toBe(1);
    expect(queue.getHistory().length).toBe(1);
    expect(queue.getHistory()[0].id).toBe('yt-1');
  });

  it('should allow host to pin a track directly to the front', () => {
    queue.addTrack(mockTrack1);
    queue.addTrack(mockTrack2);
    queue.addTrack(mockTrack3);

    // Host promotes Track 3 to immediate front
    queue.pinToTop(mockTrack3.id);
    expect(queue.getTracks()[0].id).toBe('loc-3');
  });
});
