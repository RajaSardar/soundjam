import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UniversalAudioEngine } from './UniversalAudioEngine';
import { Track } from '../../types';

describe('UniversalAudioEngine (Multi-Source Playback Orchestration)', () => {
  let engine: UniversalAudioEngine;

  const sampleYouTubeTrack: Track = {
    id: 'yt-1',
    title: 'Synthwave Radio',
    artist: 'Lofi Girl',
    duration: 300,
    source: 'youtube',
    sourceUrlOrId: 'https://youtube.com/watch?v=5qap5aO4i9A',
    addedBy: { id: 'u1', name: 'Raja' },
    upvotes: [],
    downvotes: [],
    addedAt: Date.now(),
  };

  const sampleLocalTrack: Track = {
    id: 'loc-1',
    title: 'Guitar Riff',
    artist: 'Jax',
    duration: 120,
    source: 'local',
    sourceUrlOrId: 'blob:http://localhost/riff.flac',
    addedBy: { id: 'u2', name: 'Jax' },
    upvotes: [],
    downvotes: [],
    addedAt: Date.now(),
  };

  beforeEach(() => {
    engine = new UniversalAudioEngine();
  });

  it('should load and initialize track using the appropriate adapter', async () => {
    await engine.loadTrack(sampleYouTubeTrack);
    expect(engine.getCurrentTrack()?.id).toBe('yt-1');
    expect(engine.getActiveSourceType()).toBe('youtube');

    await engine.loadTrack(sampleLocalTrack);
    expect(engine.getCurrentTrack()?.id).toBe('loc-1');
    expect(engine.getActiveSourceType()).toBe('local');
  });

  it('should play, pause, and seek correctly across adapters', async () => {
    await engine.loadTrack(sampleYouTubeTrack);
    await engine.play();
    expect(engine.isPlaying()).toBe(true);

    engine.seek(45);
    expect(engine.getCurrentTime()).toBe(45);

    engine.pause();
    expect(engine.isPlaying()).toBe(false);
  });

  it('should set master volume and apply mute status', () => {
    engine.setVolume(0.7);
    expect(engine.getVolume()).toBe(0.7);

    engine.setMuted(true);
    expect(engine.isMuted()).toBe(true);

    engine.setMuted(false);
    expect(engine.isMuted()).toBe(false);
  });
});
