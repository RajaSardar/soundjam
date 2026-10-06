import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Track, UserProfile, RoutingMode } from './types';
import { UniversalAudioEngine } from './core/audio/UniversalAudioEngine';
import { UniversalQueue } from './core/queue/UniversalQueue';
import { ClockSyncService } from './core/sync/ClockSyncService';
import { RoomSessionManager } from './core/room/RoomSessionManager';

import { Header } from './components/Header';
import { PlayerStage } from './components/PlayerStage';
import { UniversalSearchDrawer } from './components/UniversalSearchDrawer';
import { QueueDeck } from './components/QueueDeck';
import { BottomPlayerBar } from './components/BottomPlayerBar';
import { LatencyCalibrationModal } from './components/LatencyCalibrationModal';
import { AudioRoutingModal } from './components/AudioRoutingModal';
import { ShareModal } from './components/ShareModal';

const initialUser: UserProfile = {
  id: `user-${Math.floor(Math.random() * 10000)}`,
  name: 'Raja (Host)',
};

const initialTracks: Track[] = [
  {
    id: 't-1',
    title: 'Starboy (Paris Live Remix)',
    artist: 'The Weeknd & Daft Punk',
    duration: 230,
    source: 'spotify',
    sourceUrlOrId: 'spotify:track:5aAx2tiyeQdaaq7UMvMT3Y',
    coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    addedBy: { id: 'u-alex', name: 'Alex (Dev)' },
    upvotes: ['u-alex', initialUser.id],
    downvotes: [],
    addedAt: Date.now() - 30000,
  },
  {
    id: 't-2',
    title: 'Get Lucky (Funk Jam Session)',
    artist: 'Daft Punk ft. Pharrell',
    duration: 252,
    source: 'youtube',
    sourceUrlOrId: '5NV6Rdv1a3I',
    coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    addedBy: { id: 'u-dj', name: 'DJ Diesel' },
    upvotes: ['u-dj'],
    downvotes: [],
    addedAt: Date.now() - 20000,
  },
  {
    id: 't-3',
    title: 'Breathe (Chill Lo-Fi Session)',
    artist: 'Prodigy (SoundCloud VIP)',
    duration: 165,
    source: 'soundcloud',
    sourceUrlOrId: 'soundcloud-vip-stream',
    coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    addedBy: { id: 'u-chloe', name: 'Chloe (Gen-Z)' },
    upvotes: ['u-chloe'],
    downvotes: [],
    addedAt: Date.now() - 10000,
  },
  {
    id: 't-4',
    title: 'Garage Improvisation #4 (FLAC)',
    artist: 'Jax & Friends (Lossless Audio)',
    duration: 318,
    source: 'local',
    sourceUrlOrId: 'local-flac-stream',
    coverArt: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop&q=80',
    addedBy: { id: 'u-jax', name: 'Jax (Jam Host)' },
    upvotes: ['u-jax'],
    downvotes: [],
    addedAt: Date.now(),
  },
];

export function App() {
  const [roomId] = useState('JAM-777');
  const [currentUser] = useState<UserProfile>(initialUser);
  const [routingMode, setRoutingMode] = useState<RoutingMode>('mesh');
  const [latencyOffset, setLatencyOffset] = useState<number>(0);
  const [syncOffset, setSyncOffset] = useState<number>(2);
  const [deviceCount] = useState<number>(5);

  const [currentTrack, setCurrentTrack] = useState<Track | null>({
    id: 't-0',
    title: 'Midnight City (Synthwave Edit)',
    artist: 'M83 • Remixed by SoundJam',
    duration: 243,
    source: 'youtube',
    sourceUrlOrId: 'dX3k_QDnzHE',
    coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80',
    addedBy: { id: 'u-maya', name: 'Maya (Guitarist)' },
    upvotes: ['u-maya'],
    downvotes: [],
    addedAt: Date.now() - 60000,
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(102); // 1:42
  const [duration, setDuration] = useState(243);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  // Modals state
  const [isCalibOpen, setIsCalibOpen] = useState(false);
  const [isRoutingOpen, setIsRoutingOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Core Engine References
  const audioEngineRef = useRef<UniversalAudioEngine>(new UniversalAudioEngine());
  const queueRef = useRef<UniversalQueue>(new UniversalQueue(initialTracks));
  const syncServiceRef = useRef<ClockSyncService>(new ClockSyncService());
  const roomSessionRef = useRef<RoomSessionManager>(
    new RoomSessionManager({ id: roomId, name: 'Main Jam', hostId: currentUser.id })
  );

  const [queueState, setQueueState] = useState<Track[]>(queueRef.current.getTracks());
  const [skipVotes, setSkipVotes] = useState<string[]>(['u-chloe', 'u-alex']);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection & NTP sync
  useEffect(() => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 3,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('room:join', {
        roomId,
        member: {
          id: currentUser.id,
          name: currentUser.name,
          role: 'host',
          latencyOffset,
          routingMode,
          joinedAt: Date.now(),
        },
      });

      // Send initial NTP ping
      socket.emit('sync:ping', { clientSendTime: Date.now() });
    });

    socket.on('sync:pong', packet => {
      const result = syncServiceRef.current.processSample({
        ...packet,
        clientReceiveTime: Date.now(),
      });
      setSyncOffset(Math.round(result.clockOffset));
    });

    socket.on('room:updated', (updatedRoom: any) => {
      if (updatedRoom.queue) {
        setQueueState(updatedRoom.queue);
      }
      if (updatedRoom.skipVotes) {
        setSkipVotes(updatedRoom.skipVotes);
      }
      if (updatedRoom.playbackState?.currentTrack) {
        setCurrentTrack(updatedRoom.playbackState.currentTrack);
      }
    });

    // Periodic NTP sync every 12 seconds
    const syncInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('sync:ping', { clientSendTime: Date.now() });
      }
    }, 12000);

    return () => {
      clearInterval(syncInterval);
      socket.disconnect();
    };
  }, [roomId, currentUser, latencyOffset, routingMode]);

  // Audio Playhead Timer simulation & sync
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Playback Handlers
  const handlePlayPause = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    if (nextState) {
      audioEngineRef.current.play();
    } else {
      audioEngineRef.current.pause();
    }

    if (socketRef.current?.connected) {
      socketRef.current.emit('playback:control', {
        roomId,
        isPlaying: nextState,
        position: currentTime,
        hostTimestamp: Date.now(),
      });
    }
  };

  const handleSeek = (newSecs: number) => {
    setCurrentTime(newSecs);
    audioEngineRef.current.seek(newSecs);
    if (socketRef.current?.connected) {
      socketRef.current.emit('playback:control', {
        roomId,
        isPlaying,
        position: newSecs,
        hostTimestamp: Date.now(),
      });
    }
  };

  const handleNextTrack = () => {
    const next = queueRef.current.popNextTrack();
    if (next) {
      setCurrentTrack(next);
      setCurrentTime(0);
      setDuration(next.duration);
      setSkipVotes([]);
      setQueueState(queueRef.current.getTracks());
      audioEngineRef.current.loadTrack(next).then(() => {
        if (isPlaying) audioEngineRef.current.play();
      });
    }
  };

  const handlePreviousTrack = () => {
    setCurrentTime(0);
    audioEngineRef.current.seek(0);
  };

  const handleAddTrack = (track: Track) => {
    queueRef.current.addTrack(track);
    setQueueState(queueRef.current.getTracks());
    if (socketRef.current?.connected) {
      socketRef.current.emit('queue:add', { roomId, track });
    }
  };

  const handleVote = (trackId: string, type: 'up' | 'down') => {
    queueRef.current.vote(trackId, currentUser.id, type);
    setQueueState(queueRef.current.getTracks());
    if (socketRef.current?.connected) {
      socketRef.current.emit('queue:vote', { roomId, trackId, userId: currentUser.id, type });
    }
  };

  const handlePromote = (trackId: string) => {
    queueRef.current.pinToTop(trackId);
    setQueueState(queueRef.current.getTracks());
  };

  const handleRemoveTrack = (trackId: string) => {
    queueRef.current.removeTrack(trackId);
    setQueueState(queueRef.current.getTracks());
  };

  const handleVoteSkip = () => {
    let nextVotes = [...skipVotes];
    if (nextVotes.includes(currentUser.id)) {
      nextVotes = nextVotes.filter(id => id !== currentUser.id);
    } else {
      nextVotes.push(currentUser.id);
    }
    setSkipVotes(nextVotes);

    const required = Math.floor(deviceCount / 2) + 1;
    if (nextVotes.length >= required) {
      handleNextTrack();
    }

    if (socketRef.current?.connected) {
      socketRef.current.emit('queue:vote_skip', { roomId, userId: currentUser.id });
    }
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    audioEngineRef.current.setVolume(vol);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngineRef.current.setMuted(nextMute);
  };

  const handleSendReaction = (emoji: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('reaction:send', { roomId, emoji, sender: currentUser.name });
    }
  };

  const handleSaveOffset = (newOffset: number) => {
    setLatencyOffset(newOffset);
  };

  const handleSaveRouting = (newMode: RoutingMode) => {
    setRoutingMode(newMode);
    if (newMode === 'host_only') {
      audioEngineRef.current.setMuted(true);
      setIsMuted(true);
    } else {
      audioEngineRef.current.setMuted(false);
      setIsMuted(false);
    }
  };

  return (
    <div className="bg-[#0b0f19] text-slate-100 min-h-screen font-sans antialiased flex flex-col selection:bg-purple-500 selection:text-white pb-28 md:pb-24">
      {/* Top Header */}
      <Header
        roomId={roomId}
        deviceCount={deviceCount}
        syncOffsetMs={syncOffset}
        routingMode={routingMode}
        onOpenRouting={() => setIsRoutingOpen(true)}
        onOpenCalibration={() => setIsCalibOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Player Stage */}
        <div className="lg:col-span-5">
          <PlayerStage
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            skipVotes={skipVotes}
            skipVotesRequired={Math.floor(deviceCount / 2) + 1}
            currentUserId={currentUser.id}
            analyser={audioEngineRef.current.getAnalyser()}
            onVoteSkip={handleVoteSkip}
            onSendReaction={handleSendReaction}
          />
        </div>

        {/* Right Column: Search & Collaborative Queue */}
        <div className="lg:col-span-7 flex flex-col space-y-5">
          <UniversalSearchDrawer
            currentUser={currentUser}
            onAddTrack={handleAddTrack}
          />

          <QueueDeck
            queue={queueState}
            currentUserId={currentUser.id}
            isHost={true}
            onVote={handleVote}
            onPromote={handlePromote}
            onRemove={handleRemoveTrack}
          />
        </div>
      </main>

      {/* Persistent Bottom Player Bar */}
      <BottomPlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        latencyOffsetMs={latencyOffset}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onPrevious={handlePreviousTrack}
        onNext={handleNextTrack}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onOpenCalibration={() => setIsCalibOpen(true)}
      />

      {/* Modals */}
      <LatencyCalibrationModal
        isOpen={isCalibOpen}
        currentOffset={latencyOffset}
        onSaveOffset={handleSaveOffset}
        onClose={() => setIsCalibOpen(false)}
      />

      <AudioRoutingModal
        isOpen={isRoutingOpen}
        currentMode={routingMode}
        onSaveMode={handleSaveRouting}
        onClose={() => setIsRoutingOpen(false)}
      />

      <ShareModal
        isOpen={isShareOpen}
        roomId={roomId}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
export default App;
