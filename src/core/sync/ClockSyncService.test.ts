import { describe, it, expect, beforeEach } from 'vitest';
import { ClockSyncService } from './ClockSyncService';
import { ClockSyncPacket } from '../../types';

describe('ClockSyncService (NTP Synchronization & Latency Calibration)', () => {
  let syncService: ClockSyncService;

  beforeEach(() => {
    syncService = new ClockSyncService();
  });

  it('should accurately calculate RTT and offset for a single packet', () => {
    // Suppose client sends at t1=1000
    // Server receives at t2=1050 (server clock is +30ms ahead, plus 20ms one-way delay)
    // Server sends at t3=1052 (2ms server processing)
    // Client receives at t4=1092 (40ms round-trip total minus processing = 38ms true network RTT)
    const packet: ClockSyncPacket = {
      clientSendTime: 1000,
      serverReceiveTime: 1050,
      serverSendTime: 1052,
      clientReceiveTime: 1092,
    };

    const result = syncService.processSample(packet);

    // RTT = (1092 - 1000) - (1052 - 1050) = 92 - 2 = 90ms
    expect(result.roundTripTime).toBe(90);

    // Offset θ = ((t2 - t1) + (t3 - t4)) / 2 = ((1050 - 1000) + (1052 - 1092)) / 2 = (50 - 40) / 2 = +5ms
    expect(result.clockOffset).toBe(5);
  });

  it('should reject high-RTT jitter spikes as outliers', () => {
    // Feed 4 normal low-jitter samples (RTT ~20ms, offset +10ms)
    for (let i = 0; i < 4; i++) {
      syncService.processSample({
        clientSendTime: 1000 + i * 100,
        serverReceiveTime: 1020 + i * 100,
        serverSendTime: 1021 + i * 100,
        clientReceiveTime: 1041 + i * 100,
      });
    }

    const baselineOffset = syncService.getOffset();

    // Now feed a massive Wi-Fi lag spike (RTT = 300ms)
    syncService.processSample({
      clientSendTime: 2000,
      serverReceiveTime: 2250,
      serverSendTime: 2252,
      clientReceiveTime: 2302,
    });

    // The smoothed offset should remain protected and close to baseline
    expect(Math.abs(syncService.getOffset() - baselineOffset)).toBeLessThan(5);
  });

  it('should accurately calculate local play time taking hardware latency offset into account', () => {
    // Set fixed offset = +20ms (client is 20ms ahead of server)
    syncService.processSample({
      clientSendTime: 1000,
      serverReceiveTime: 990,
      serverSendTime: 991,
      clientReceiveTime: 1011,
    });
    // Offset θ = ((990 - 1000) + (991 - 1011)) / 2 = (-10 + -20) / 2 = -15ms
    // Host is 15ms behind client

    const hostTargetTime = 50000;
    // Suppose user has a Bluetooth speaker with +150ms buffer delay
    const bluetoothDelay = 150;

    const scheduledTime = syncService.calculateLocalExecutionTime(hostTargetTime, bluetoothDelay);
    
    // To compensate for a +150ms speaker delay, audio must be triggered 150ms earlier!
    // ScheduledLocalTime = (hostTargetTime + offset) - bluetoothDelay
    const expected = (hostTargetTime + syncService.getOffset()) - bluetoothDelay;
    expect(scheduledTime).toBe(expected);
  });

  it('should calculate host timestamp from local timestamp', () => {
    syncService.setManualOffset(50); // client is 50ms ahead of host
    const localNow = 10000;
    const hostTime = syncService.getSynchronizedHostTime(localNow);
    expect(hostTime).toBe(10000 - 50); // 9950ms
  });
});
