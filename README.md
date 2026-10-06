# 🎧 SoundJam — Universal Multi-Source Collaborative Jam Music App

> Play music from **any source** (YouTube, Spotify, SoundCloud, Local FLAC/MP3, and Web Streams) in a single unified queue with microsecond-precision **multi-device synchronized audio playback**.

Designed and debated across 30 expert domains (App Dev, Musician, Jam Host, Composer, CEO, CTO, UX Lead, Audiophile, Club DJ, Network Protocol Engineer, Web Audio DSP, Copyright Counsel, and Accessibility).

---

## 🌟 Core Features

- 🌐 **Universal Source Playback Engine**:
  - Play YouTube videos/audio, Spotify tracks/previews, SoundCloud streams, Local FLAC/MP3/WAV files, and direct Web Audio streams seamlessly within one queue.
  - Pluggable `UniversalAudioEngine` with automated source adapters.
- 👥 **Real-Time Collaborative Jam Sessions**:
  - Join via ephemeral room code (e.g. `JAM-777`) or QR code invite.
  - Multi-user collaborative queue with instant upvoting and downvoting.
  - Democratic skip voting threshold ($> 50\%$ active members) with host override.
  - Live reaction emoji bursts (🔥, ❤️, ⚡, 💃, 🎧) floating across album art.
- ⏱️ **Microsecond Multi-Device Synchronized Playback**:
  - **NTP Cristian's Algorithm** over WebSockets to calculate network clock offsets and jitter.
  - **Latency Calibration Slider ($\pm 300\text{ms}$)** with audible metronome click test to eliminate Bluetooth speaker buffer delays.
  - **Audio Routing Modes**:
    1. *Party Mesh / Silent Disco*: All connected phones & speakers play audio in sync.
    2. *Host Aux / TV Speaker Only*: Remote control mode (phones mute audio and control the queue).
    3. *Personal Headphones*: Synchronized listening with custom volume/EQ.
- 🎨 **Modern Cyber-Vinyl UI/UX**:
  - Spinning vinyl record player, ambient gradient glow, responsive bottom player bar, and HTML5 Canvas audio spectrum visualizer (throttled when tab is hidden to save battery).
- 🧪 **100% Test-Driven Development (TDD)**:
  - Unit and integration test suites covering clock synchronization, queue CRDT sorting, room governance, and audio engine orchestration with Vitest.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Test Suite (TDD)
```bash
npm test
```

### 3. Start Sync Backend Server
```bash
node --loader ts-node/esm server/index.ts
```

### 4. Start Frontend Dev Server
```bash
npm run dev
```

Visit `http://localhost:3000` on your desktop and phone (on the same local network or via tunnel) to experience synchronized playback!

---

## 🏗️ Architecture

```
src/
├── core/
│   ├── sync/
│   │   ├── ClockSyncService.ts        # NTP Cristian's algorithm & latency offsets
│   │   └── ClockSyncService.test.ts   # TDD test suite
│   ├── queue/
│   │   ├── UniversalQueue.ts          # Unified queue, upvoting, score ranking
│   │   └── UniversalQueue.test.ts     # TDD test suite
│   ├── room/
│   │   ├── RoomSessionManager.ts      # Democratic & DJ room governance
│   │   └── RoomSessionManager.test.ts # TDD test suite
│   └── audio/
│       ├── UniversalAudioEngine.ts    # Multi-source playback dispatcher
│       ├── adapters/                  # YouTube, Spotify, SoundCloud, WebAudio
│       └── UniversalAudioEngine.test.ts
├── components/
│   ├── Header.tsx                     # Top status bar & routing picker
│   ├── PlayerStage.tsx                # Vinyl disc, canvas waveform, reactions
│   ├── WaveformVisualizer.tsx         # Canvas 60fps audio visualizer
│   ├── QueueDeck.tsx                  # Collaborative queue & vote buttons
│   ├── UniversalSearchDrawer.tsx      # Multi-source search & local file upload
│   ├── LatencyCalibrationModal.tsx    # ±300ms slider & metronome click test
│   ├── AudioRoutingModal.tsx          # Party Mesh vs Host Aux vs Headphones
│   ├── ShareModal.tsx                 # QR code & invite link
│   └── BottomPlayerBar.tsx            # Scrubber, play/pause, volume, quick offset
server/
├── index.ts                           # Express + Socket.io server
├── syncServer.ts                      # High-precision NTP ping/pong handler
└── roomStore.ts                       # In-memory collaborative room state
```

---

## 📜 License
MIT License. Open source and built for music lovers worldwide.
