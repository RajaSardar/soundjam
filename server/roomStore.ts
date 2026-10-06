import { JamRoom, Track, RoomMember } from '../src/types';

export class RoomStore {
  private rooms: Map<string, JamRoom> = new Map();

  constructor() {
    // Seed default room JAM-777 for quick testing
    this.createRoom({
      id: 'JAM-777',
      name: 'Central Jam Room',
      hostId: 'host-main',
      governance: 'democracy',
      explicitFilter: false,
      members: [],
      queue: [
        {
          id: 'track-1',
          title: 'Midnight City (Synthwave Edit)',
          artist: 'M83',
          duration: 243,
          source: 'youtube',
          sourceUrlOrId: 'dX3k_QDnzHE',
          coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80',
          addedBy: { id: 'host-main', name: 'Maya (Host)' },
          upvotes: ['host-main', 'user-2'],
          downvotes: [],
          addedAt: Date.now() - 30000,
        },
        {
          id: 'track-2',
          title: 'Starboy (Paris Live Remix)',
          artist: 'The Weeknd & Daft Punk',
          duration: 230,
          source: 'spotify',
          sourceUrlOrId: 'spotify:track:5aAx2tiyeQdaaq7UMvMT3Y',
          coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
          addedBy: { id: 'user-2', name: 'Alex (Dev)' },
          upvotes: ['user-2'],
          downvotes: [],
          addedAt: Date.now() - 20000,
        },
      ],
      history: [],
      skipVotes: [],
      playbackState: {
        currentTrack: {
          id: 'track-0',
          title: 'Get Lucky (Funk Jam Session)',
          artist: 'Daft Punk ft. Pharrell',
          duration: 252,
          source: 'youtube',
          sourceUrlOrId: '5NV6Rdv1a3I',
          coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80',
          addedBy: { id: 'host-main', name: 'Maya (Host)' },
          upvotes: ['host-main'],
          downvotes: [],
          addedAt: Date.now() - 60000,
        },
        isPlaying: true,
        position: 45,
        startedAtHostTime: Date.now() - 45000,
        volume: 0.85,
        muted: false,
      },
    });
  }

  public getRoom(roomId: string): JamRoom | undefined {
    return this.rooms.get(roomId);
  }

  public createRoom(room: JamRoom): JamRoom {
    this.rooms.set(room.id, room);
    return room;
  }

  public addMember(roomId: string, member: RoomMember): JamRoom | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    room.members = room.members.filter(m => m.id !== member.id);
    room.members.push(member);
    return room;
  }

  public removeMember(roomId: string, memberId: string): JamRoom | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    room.members = room.members.filter(m => m.id !== memberId);
    room.skipVotes = room.skipVotes.filter(id => id !== memberId);
    return room;
  }

  public addTrackToQueue(roomId: string, track: Track): JamRoom | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    if (!room.queue.some(t => t.id === track.id)) {
      room.queue.push(track);
      this.sortQueue(room);
    }
    return room;
  }

  public voteTrack(roomId: string, trackId: string, userId: string, type: 'up' | 'down'): JamRoom | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    const track = room.queue.find(t => t.id === trackId);
    if (!track) return room;

    if (type === 'up') {
      if (track.upvotes.includes(userId)) {
        track.upvotes = track.upvotes.filter(id => id !== userId);
      } else {
        track.upvotes.push(userId);
        track.downvotes = track.downvotes.filter(id => id !== userId);
      }
    } else {
      if (track.downvotes.includes(userId)) {
        track.downvotes = track.downvotes.filter(id => id !== userId);
      } else {
        track.downvotes.push(userId);
        track.upvotes = track.upvotes.filter(id => id !== userId);
      }
    }

    this.sortQueue(room);
    return room;
  }

  public voteSkip(roomId: string, userId: string): { room: JamRoom; skipped: boolean } | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    if (!room.skipVotes.includes(userId)) {
      room.skipVotes.push(userId);
    }

    const required = Math.floor(room.members.length / 2) + 1;
    let skipped = false;

    if (room.skipVotes.length >= required || userId === room.hostId) {
      this.advanceQueue(room);
      skipped = true;
    }

    return { room, skipped };
  }

  public advanceQueue(room: JamRoom): void {
    if (room.playbackState.currentTrack) {
      room.history.unshift(room.playbackState.currentTrack);
    }
    const next = room.queue.shift() || null;
    room.playbackState.currentTrack = next;
    room.playbackState.position = 0;
    room.playbackState.startedAtHostTime = Date.now();
    room.playbackState.isPlaying = next !== null;
    room.skipVotes = [];
  }

  private sortQueue(room: JamRoom): void {
    room.queue.sort((a, b) => {
      const scoreA = (a.upvotes.length - a.downvotes.length) * 10000 - a.addedAt;
      const scoreB = (b.upvotes.length - b.downvotes.length) * 10000 - b.addedAt;
      return scoreB - scoreA;
    });
  }
}

export const roomStore = new RoomStore();
