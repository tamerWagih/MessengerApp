export interface Message {
  id: number;
  senderId: number;
  senderUsername: string;
  senderphotoUrl: string;
  recipientId: number;
  recipientUsername: string;
  recipientPhotoUrl: string;
  content: string;
  dateRead?: Date;
  messageSent: Date;
}
