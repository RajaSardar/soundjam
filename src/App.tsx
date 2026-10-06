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

// Verified, real playable audio streams
const initialTracks: Track[] = [
  {
    id: 't-1',
    title: 'Yellow (Acoustic Master)',
    artist: 'Coldplay',
    duration: 269,
    source: 'stream',
    sourceUrlOrId: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/66/f3/1a/66f31a76-a6ed-cb4c-f353-23310a7ae9a8/mzaf_10593596652344378873.plus.aac.p.m4a',
    coverArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f5/93/8c/f5938c49-964c-31d1-4b33-78b634f71fb7/190295978075.jpg/400x400bb.jpg',
    addedBy: { id: 'u-alex', name: 'Alex (Dev)' },
    upvotes: ['u-alex', initialUser.id],
    downvotes: [],
    addedAt: Date.now() - 30000,
  },
  {
    id: 't-2',
    title: 'Viva La Vida',
    artist: 'Coldplay',
    duration: 241,
    source: 'stream',
    sourceUrlOrId: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b0/19/60/b0196060-7786-24c0-8c56-8f628fe89f52/mzaf_12479456646715449366.plus.aac.p.m4a',
    coverArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/52/aa/85/52aa851f-15b7-6322-f91f-df84b15b7b19/190295978044.jpg/400x400bb.jpg',
    addedBy: { id: 'u-dj', name: 'DJ Diesel' },
    upvotes: ['u-dj'],
    downvotes: [],
    addedAt: Date.now() - 20000,
  },
  {
    id: 't-3',
    title: 'Coffee House Ambient Session',
    artist: 'Google Audio Labs',
    duration: 140,
    source: 'stream',
    sourceUrlOrId: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
    coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
    addedBy: { id: 'u-chloe', name: 'Chloe (Gen-Z)' },
    upvotes: ['u-chloe'],
    downvotes: [],
    addedAt: Date.now() - 10000,
  },
  {
    id: 't-4',
    title: 'Synthwave Night Ride',
    artist: 'Retro Dreamer',
    duration: 210,
    source: 'stream',
    sourceUrlOrId: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
    coverArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
    addedBy: { id: 'u-jax', name: 'Jax (Jam Host)' },
    upvotes: ['u-jax'],
    downvotes: [],
    addedAt: Date.now(),
  },
];

const initialCurrentTrack: Track = {
  id: 't-0',
  title: 'Kangaroo MusiQue (RPG Groove)',
  artist: 'DDR Classics Studio',
  duration: 125,
  source: 'stream',
  sourceUrlOrId: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3',
  coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80',
  addedBy: { id: 'u-maya', name: 'Maya (Guitarist)' },
  upvotes: ['u-maya'],
  downvotes: [],
  addedAt: Date.now() - 60000,
};

export function App() {
  const [roomId] = useState('JAM-777');
  const [currentUser] = useState<UserProfile>(initialUser);
  const [routingMode, setRoutingMode] = useState<RoutingMode>('mesh');
  const [latencyOffset, setLatencyOffset] = useState<number>(0);
  const [syncOffset, setSyncOffset] = useState<number>(2);
  const [deviceCount] = useState<number>(5);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(initialCurrentTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(125);
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
  const [skipVotes, setSkipVotes] = useState<string[]>(['u-chloe']);
  const socketRef = useRef<Socket | null>(null);

  // Auto-unlock audio on first touch/click
  useEffect(() => {
    const handleGesture = () => {
      audioEngineRef.current.unlock();
    };
    window.addEventListener('click', handleGesture, { once: true });
    window.addEventListener('touchstart', handleGesture, { once: true });
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('touchstart', handleGesture);
    };
  }, []);

  // Connect real audio engine lifecycle events
  useEffect(() => {
    const engine = audioEngineRef.current;
    engine.setOnTimeUpdate((time) => {
      setCurrentTime(Math.floor(time));
      const realDur = engine.getDuration();
      if (realDur > 0 && realDur !== duration) {
        setDuration(Math.floor(realDur));
      }
    });

    engine.setOnEnded(() => {
      handleNextTrack();
    });

    // Load initial track
    if (initialCurrentTrack) {
      engine.loadTrack(initialCurrentTrack).catch((err) => {
        console.warn('Initial track load:', err);
      });
    }
  }, []);

  // Socket connection & NTP sync
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

  // Playback Handlers
  const handlePlayPause = async () => {
    const engine = audioEngineRef.current;
    engine.unlock();

    if (!isPlaying) {
      if (!engine.getCurrentTrack() && currentTrack) {
        await engine.loadTrack(currentTrack);
      }
      try {
        await engine.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Playback error:', err);
      }
    } else {
      engine.pause();
      setIsPlaying(false);
    }

    if (socketRef.current?.connected) {
      socketRef.current.emit('playback:control', {
        roomId,
        isPlaying: !isPlaying,
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

  const handlePlayNow = async (track: Track) => {
    const engine = audioEngineRef.current;
    engine.unlock();
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(track.duration || 180);
    setIsPlaying(true);
    await engine.loadTrack(track);
    try {
      await engine.play();
    } catch (e) {
      console.warn('Play now failed:', e);
    }
  };

  const handleNextTrack = async () => {
    const next = queueRef.current.popNextTrack();
    if (next) {
      setCurrentTrack(next);
      setCurrentTime(0);
      setDuration(next.duration || 180);
      setSkipVotes([]);
      setQueueState(queueRef.current.getTracks());
      const engine = audioEngineRef.current;
      await engine.loadTrack(next);
      if (isPlaying) {
        try {
          await engine.play();
        } catch (e) {}
      }
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
            onPlayNow={handlePlayNow}
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
