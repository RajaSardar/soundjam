import { RoomMember, RoomGovernance, RoutingMode } from '../../types';

export interface RoomOptions {
  id: string;
  name: string;
  hostId: string;
  governance?: RoomGovernance;
  explicitFilter?: boolean;
}

export class RoomSessionManager {
  private id: string;
  private name: string;
  private hostId: string;
  private governance: RoomGovernance;
  private explicitFilter: boolean;
  private members: Map<string, RoomMember> = new Map();
  private skipVotes: Set<string> = new Set();

  constructor(options: RoomOptions) {
    this.id = options.id;
    this.name = options.name;
    this.hostId = options.hostId;
    this.governance = options.governance || 'democracy';
    this.explicitFilter = options.explicitFilter || false;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getHostId(): string {
    return this.hostId;
  }

  public getGovernance(): RoomGovernance {
    return this.governance;
  }

  public setGovernance(governance: RoomGovernance): void {
    this.governance = governance;
  }

  public addMember(member: RoomMember): void {
    this.members.set(member.id, member);
  }

  public removeMember(memberId: string): void {
    this.members.delete(memberId);
    this.skipVotes.delete(memberId);
  }

  public getMembers(): RoomMember[] {
    return Array.from(this.members.values());
  }

  public getMember(memberId: string): RoomMember | undefined {
    return this.members.get(memberId);
  }

  public updateMemberLatency(memberId: string, offsetMs: number): void {
    const member = this.members.get(memberId);
    if (member) {
      member.latencyOffset = offsetMs;
    }
  }

  public updateMemberRouting(memberId: string, mode: RoutingMode): void {
    const member = this.members.get(memberId);
    if (member) {
      member.routingMode = mode;
    }
  }

  public getSkipVotesRequired(): number {
    const total = this.members.size;
    if (total <= 1) return 1;
    // Strictly greater than 50%
    return Math.floor(total / 2) + 1;
  }

  public voteSkip(memberId: string): boolean {
    if (!this.members.has(memberId)) return false;
    this.skipVotes.add(memberId);
    return this.skipVotes.size >= this.getSkipVotesRequired();
  }

  public removeSkipVote(memberId: string): void {
    this.skipVotes.delete(memberId);
  }

  public forceSkip(memberId: string): boolean {
    if (memberId === this.hostId) {
      this.resetSkipVotes();
      return true;
    }
    return false;
  }

  public getSkipVotes(): string[] {
    return Array.from(this.skipVotes);
  }

  public resetSkipVotes(): void {
    this.skipVotes.clear();
  }
}
