import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { roomStore } from './roomStore';
import { setupSyncProtocol } from './syncServer';
import { RoomMember, Track } from '../src/types';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = roomStore.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

io.on('connection', (socket: Socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Setup low-overhead NTP clock sync
  setupSyncProtocol(socket);

  // Join Jam Room
  socket.on('room:join', (data: { roomId: string; member: RoomMember }) => {
    const { roomId, member } = data;
    socket.join(roomId);

    const room = roomStore.addMember(roomId, member);
    if (room) {
      io.to(roomId).emit('room:updated', room);
      console.log(`[Room] ${member.name} joined ${roomId} (${room.members.length} members)`);
    }
  });

  // Add Track to Queue
  socket.on('queue:add', (data: { roomId: string; track: Track }) => {
    const { roomId, track } = data;
    const room = roomStore.addTrackToQueue(roomId, track);
    if (room) {
      io.to(roomId).emit('room:updated', room);
      io.to(roomId).emit('notification', {
        message: `${track.addedBy.name} added "${track.title}"`,
      });
    }
  });

  // Vote on Track (Upvote / Downvote)
  socket.on('queue:vote', (data: { roomId: string; trackId: string; userId: string; type: 'up' | 'down' }) => {
    const { roomId, trackId, userId, type } = data;
    const room = roomStore.voteTrack(roomId, trackId, userId, type);
    if (room) {
      io.to(roomId).emit('room:updated', room);
    }
  });

  // Vote to Skip Track
  socket.on('queue:vote_skip', (data: { roomId: string; userId: string }) => {
    const { roomId, userId } = data;
    const result = roomStore.voteSkip(roomId, userId);
    if (result) {
      io.to(roomId).emit('room:updated', result.room);
      if (result.skipped) {
        io.to(roomId).emit('notification', {
          message: 'Majority skip reached! Next track playing.',
        });
      }
    }
  });

  // Playback Control (Play / Pause / Seek)
  socket.on('playback:control', (data: {
    roomId: string;
    isPlaying: boolean;
    position: number;
    hostTimestamp: number;
  }) => {
    const { roomId, isPlaying, position, hostTimestamp } = data;
    const room = roomStore.getRoom(roomId);
    if (room) {
      room.playbackState.isPlaying = isPlaying;
      room.playbackState.position = position;
      room.playbackState.startedAtHostTime = hostTimestamp;
      io.to(roomId).emit('playback:sync', room.playbackState);
    }
  });

  // Live Emoji Reactions
  socket.on('reaction:send', (data: { roomId: string; emoji: string; sender: string }) => {
    io.to(data.roomId).emit('reaction:received', data);
  });

  // Disconnect
  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        const room = roomStore.removeMember(roomId, socket.id);
        if (room) {
          io.to(roomId).emit('room:updated', room);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[SoundJam Server] Running on http://localhost:${PORT}`);
});

export { app, httpServer, io };
