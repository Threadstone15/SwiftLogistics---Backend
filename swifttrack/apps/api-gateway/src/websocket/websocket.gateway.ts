import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WSGateway({
  cors: {
    origin: '*',
  },
})
export class WebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebSocketGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-tracking')
  handleJoinTracking(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`order-${data.orderId}`);
    this.logger.log(`Client ${client.id} joined tracking for order ${data.orderId}`);
  }

  @SubscribeMessage('leave-tracking')
  handleLeaveTracking(
    @MessageBody() data: { orderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`order-${data.orderId}`);
    this.logger.log(`Client ${client.id} left tracking for order ${data.orderId}`);
  }

  // Method to broadcast location updates
  broadcastLocationUpdate(orderId: string, location: { lng: number; lat: number }) {
    this.server.to(`order-${orderId}`).emit('location-update', {
      orderId,
      location,
      timestamp: new Date(),
    });
  }

  // Method to broadcast status updates
  broadcastStatusUpdate(orderId: string, status: string) {
    this.server.to(`order-${orderId}`).emit('status-update', {
      orderId,
      status,
      timestamp: new Date(),
    });
  }
}
