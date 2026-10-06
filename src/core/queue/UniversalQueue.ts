import { Track } from '../../types';

export class UniversalQueue {
  private queue: Track[] = [];
  private history: Track[] = [];
  private pinnedTrackId: string | null = null;

  constructor(initialTracks: Track[] = []) {
    this.queue = [...initialTracks];
    this.sortQueue();
  }

  public addTrack(track: Track): void {
    // Avoid exact duplicate additions with same ID
    const exists = this.queue.some(t => t.id === track.id);
    if (!exists) {
      this.queue.push({
        ...track,
        upvotes: [...(track.upvotes || [])],
        downvotes: [...(track.downvotes || [])],
        addedAt: track.addedAt || Date.now(),
      });
      this.sortQueue();
    }
  }

  public removeTrack(trackId: string): boolean {
    const initialLen = this.queue.length;
    this.queue = this.queue.filter(t => t.id !== trackId);
    if (this.pinnedTrackId === trackId) {
      this.pinnedTrackId = null;
    }
    return this.queue.length < initialLen;
  }

  public vote(trackId: string, userId: string, voteType: 'up' | 'down'): void {
    const track = this.queue.find(t => t.id === trackId);
    if (!track) return;

    if (voteType === 'up') {
      const hasUpvoted = track.upvotes.includes(userId);
      // Toggle off if already upvoted
      if (hasUpvoted) {
        track.upvotes = track.upvotes.filter(id => id !== userId);
      } else {
        track.upvotes.push(userId);
        // Remove from downvotes if previously downvoted
        track.downvotes = track.downvotes.filter(id => id !== userId);
      }
    } else {
      const hasDownvoted = track.downvotes.includes(userId);
      // Toggle off if already downvoted
      if (hasDownvoted) {
        track.downvotes = track.downvotes.filter(id => id !== userId);
      } else {
        track.downvotes.push(userId);
        // Remove from upvotes if previously upvoted
        track.upvotes = track.upvotes.filter(id => id !== userId);
      }
    }

    this.sortQueue();
  }

  public pinToTop(trackId: string): void {
    const trackIndex = this.queue.findIndex(t => t.id === trackId);
    if (trackIndex > -1) {
      this.pinnedTrackId = trackId;
      const [pinned] = this.queue.splice(trackIndex, 1);
      this.queue.unshift(pinned);
    }
  }

  private sortQueue(): void {
    const pinnedTrack = this.pinnedTrackId ? this.queue.find(t => t.id === this.pinnedTrackId) : null;
    const remaining = this.pinnedTrackId ? this.queue.filter(t => t.id !== this.pinnedTrackId) : [...this.queue];

    remaining.sort((a, b) => {
      const scoreA = (a.upvotes.length - a.downvotes.length) * 10000 - a.addedAt;
      const scoreB = (b.upvotes.length - b.downvotes.length) * 10000 - b.addedAt;
      return scoreB - scoreA;
    });

    if (pinnedTrack) {
      this.queue = [pinnedTrack, ...remaining];
    } else {
      this.queue = remaining;
    }
  }

  public popNextTrack(): Track | null {
    if (this.queue.length === 0) return null;
    const next = this.queue.shift()!;
    this.history.unshift(next);
    if (this.pinnedTrackId === next.id) {
      this.pinnedTrackId = null;
    }
    return next;
  }

  public getTracks(): Track[] {
    return [...this.queue];
  }

  public getHistory(): Track[] {
    return [...this.history];
  }

  public clear(): void {
    this.queue = [];
    this.pinnedTrackId = null;
  }
}
