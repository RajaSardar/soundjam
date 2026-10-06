import { ClockSyncPacket, ClockSyncResult } from '../../types';

export class ClockSyncService {
  private offsetHistory: { offset: number; rtt: number }[] = [];
  private currentOffset: number = 0;
  private readonly maxSamples: number = 8;

  constructor() {}

  /**
   * Process a 4-timestamp NTP packet (Cristian's algorithm)
   */
  public processSample(packet: ClockSyncPacket): ClockSyncResult {
    const t1 = packet.clientSendTime;
    const t2 = packet.serverReceiveTime;
    const t3 = packet.serverSendTime;
    const t4 = packet.clientReceiveTime ?? Date.now();

    const roundTripTime = (t4 - t1) - (t3 - t2);
    const clockOffset = ((t2 - t1) + (t3 - t4)) / 2;

    // Outlier rejection: if we have existing samples, reject if RTT is > 2.5x the minimum recorded RTT
    let shouldInclude = true;
    if (this.offsetHistory.length >= 3) {
      const minRtt = Math.min(...this.offsetHistory.map(s => s.rtt));
      if (roundTripTime > minRtt * 2.5 && roundTripTime > 80) {
        shouldInclude = false;
      }
    }

    if (shouldInclude) {
      this.offsetHistory.push({ offset: clockOffset, rtt: roundTripTime });
      if (this.offsetHistory.length > this.maxSamples) {
        this.offsetHistory.shift();
      }
      this.recomputeOffset();
    }

    return {
      roundTripTime,
      clockOffset,
      confidence: shouldInclude ? 1.0 : 0.2,
    };
  }

  private recomputeOffset(): void {
    if (this.offsetHistory.length === 0) return;
    // Sort samples by lowest RTT (lowest RTT has highest accuracy)
    const sorted = [...this.offsetHistory].sort((a, b) => a.rtt - b.rtt);
    // Take the best half of samples
    const bestSamples = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 2)));
    const sum = bestSamples.reduce((acc, curr) => acc + curr.offset, 0);
    this.currentOffset = sum / bestSamples.length;
  }

  public getOffset(): number {
    return this.currentOffset;
  }

  public setManualOffset(offset: number): void {
    this.currentOffset = offset;
  }

  /**
   * Get host timestamp for a given local timestamp
   * LocalTime = HostTime + Offset => HostTime = LocalTime - Offset
   */
  public getSynchronizedHostTime(localTime: number = Date.now()): number {
    return localTime - this.currentOffset;
  }

  /**
   * Calculate local timestamp when this device should start audio playback,
   * accounting for host-client offset and hardware (Bluetooth) buffer delay.
   * If a device has a +150ms Bluetooth delay, it needs to start 150ms earlier in local time.
   */
  public calculateLocalExecutionTime(hostTargetTimestamp: number, hardwareLatencyOffsetMs: number = 0): number {
    return (hostTargetTimestamp + this.currentOffset) - hardwareLatencyOffsetMs;
  }

  public reset(): void {
    this.offsetHistory = [];
    this.currentOffset = 0;
  }
}
