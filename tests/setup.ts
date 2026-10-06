// Vitest Test Setup & Web Audio API Mocks
import '@testing-library/jest-dom';
import { vi } from 'vitest';

class MockAudioNode {
  connect(_target: any) {
    return _target;
  }
  disconnect() {}
}

class MockGainNode extends MockAudioNode {
  gain = {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
}

class MockOscillatorNode extends MockAudioNode {
  type = 'sine';
  frequency = {
    value: 440,
    setValueAtTime: vi.fn(),
  };
  start = vi.fn();
  stop = vi.fn();
}

class MockAnalyserNode extends MockAudioNode {
  fftSize = 2048;
  frequencyBinCount = 1024;
  getByteFrequencyData(array: Uint8Array) {
    array.fill(128);
  }
}

class MockAudioContext {
  currentTime = 0;
  state = 'running';
  destination = new MockAudioNode();
  createGain() {
    return new MockGainNode();
  }
  createOscillator() {
    return new MockOscillatorNode();
  }
  createAnalyser() {
    return new MockAnalyserNode();
  }
  createBufferSource() {
    return {
      buffer: null,
      playbackRate: { value: 1 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  resume = vi.fn().mockResolvedValue(undefined);
  suspend = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
}

// Attach to global window
(global as any).AudioContext = MockAudioContext;
(global as any).webkitAudioContext = MockAudioContext;

// Mock HTMLMediaElement methods
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();
