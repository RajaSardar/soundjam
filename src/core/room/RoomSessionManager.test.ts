import { describe, it, expect, beforeEach } from 'vitest';
import { RoomSessionManager } from './RoomSessionManager';

describe('RoomSessionManager (Governance, Roles & Skip Thresholds)', () => {
  let room: RoomSessionManager;

  beforeEach(() => {
    room = new RoomSessionManager({
      id: 'JAM-777',
      name: 'Weekend Groove',
      hostId: 'host-1',
    });
  });

  it('should initialize room with host and default democratic governance', () => {
    expect(room.getId()).toBe('JAM-777');
    expect(room.getHostId()).toBe('host-1');
    expect(room.getGovernance()).toBe('democracy');
  });

  it('should manage room members and roles', () => {
    room.addMember({
      id: 'host-1',
      name: 'Raja',
      role: 'host',
      latencyOffset: 0,
      routingMode: 'mesh',
      joinedAt: 1000,
    });

    room.addMember({
      id: 'user-2',
      name: 'Maya',
      role: 'contributor',
      latencyOffset: 120,
      routingMode: 'mesh',
      joinedAt: 1050,
    });

    expect(room.getMembers().length).toBe(2);
    expect(room.getMember('user-2')?.latencyOffset).toBe(120);
  });

  it('should enforce democratic skip voting threshold (>50% of active members)', () => {
    // 4 members
    ['host-1', 'm-2', 'm-3', 'm-4'].forEach(id => {
      room.addMember({
        id,
        name: `User ${id}`,
        role: id === 'host-1' ? 'host' : 'listener',
        latencyOffset: 0,
        routingMode: 'mesh',
        joinedAt: Date.now(),
      });
    });

    // 4 members -> threshold is > 50% = 3 votes required
    expect(room.getSkipVotesRequired()).toBe(3);

    // Member 2 and 3 vote to skip (total 2 votes) -> not skipped yet
    expect(room.voteSkip('m-2')).toBe(false);
    expect(room.voteSkip('m-3')).toBe(false);
    expect(room.getSkipVotes().length).toBe(2);

    // Member 4 votes to skip (total 3 votes) -> threshold reached!
    expect(room.voteSkip('m-4')).toBe(true);
  });

  it('should allow host to force-skip immediately regardless of vote count', () => {
    room.addMember({
      id: 'host-1',
      name: 'Raja',
      role: 'host',
      latencyOffset: 0,
      routingMode: 'mesh',
      joinedAt: Date.now(),
    });

    room.addMember({
      id: 'm-2',
      name: 'Guest',
      role: 'listener',
      latencyOffset: 0,
      routingMode: 'mesh',
      joinedAt: Date.now(),
    });

    expect(room.forceSkip('host-1')).toBe(true);
    // Non-host cannot force skip
    expect(room.forceSkip('m-2')).toBe(false);
  });

  it('should update member latency offset and routing mode', () => {
    room.addMember({
      id: 'm-3',
      name: 'Klaus',
      role: 'listener',
      latencyOffset: 0,
      routingMode: 'mesh',
      joinedAt: Date.now(),
    });

    room.updateMemberLatency('m-3', 180);
    expect(room.getMember('m-3')?.latencyOffset).toBe(180);

    room.updateMemberRouting('m-3', 'host_only');
    expect(room.getMember('m-3')?.routingMode).toBe('host_only');
  });
});
