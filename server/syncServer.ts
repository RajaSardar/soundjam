import { Socket } from 'socket.io';
import { ClockSyncPacket } from '../src/types';

export function setupSyncProtocol(socket: Socket) {
  // Ultra-low overhead NTP ping/pong
  socket.on('sync:ping', (data: { clientSendTime: number }) => {
    const serverReceiveTime = Date.now();
    const serverSendTime = Date.now();

    const response: ClockSyncPacket = {
      clientSendTime: data.clientSendTime,
      serverReceiveTime,
      serverSendTime,
    };

    socket.emit('sync:pong', response);
  });
}
