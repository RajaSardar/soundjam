export type AudioSourceType = 'youtube' | 'spotify' | 'soundcloud' | 'local' | 'stream';

export type RoutingMode = 'mesh' | 'host_only' | 'personal';

export type RoomGovernance = 'democracy' | 'dj' | 'fair_share';

export type UserRole = 'host' | 'dj' | 'contributor' | 'listener';

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  source: AudioSourceType;
  sourceUrlOrId: string;
  coverArt?: string;
  addedBy: UserProfile;
  upvotes: string[]; // user IDs
  downvotes: string[]; // user IDs
  addedAt: number; // timestamp
}

export interface PlaybackState {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number; // seconds
  startedAtHostTime: number; // host millisecond timestamp
  volume: number; // 0 - 1
  muted: boolean;
}

export interface RoomMember {
  id: string;
  name: string;
  role: UserRole;
  latencyOffset: number; // ms compensation (-300 to +300)
  routingMode: RoutingMode;
  joinedAt: number;
}

export interface JamRoom {
  id: string;
  name: string;
  hostId: string;
  governance: RoomGovernance;
  explicitFilter: boolean;
  members: RoomMember[];
  queue: Track[];
  history: Track[];
  skipVotes: string[]; // member IDs who voted to skip
  playbackState: PlaybackState;
}

export interface ClockSyncPacket {
  clientSendTime: number; // t1
  serverReceiveTime: number; // t2
  serverSendTime: number; // t3
  clientReceiveTime?: number; // t4
}

export interface ClockSyncResult {
  roundTripTime: number; // RTT (ms)
  clockOffset: number; // θ (ms): clientTime - serverTime
  confidence: number;
}
