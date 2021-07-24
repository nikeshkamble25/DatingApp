export interface Message {
  id: number;
  senderId: number;
  senderKnownAs: string;
  senderPhotoUrl: string;
  recipientId: number;
  recipientKnownAs: string;
  recipientPhotoUrl: string;
  content: string;
  isRead: boolean;
  dateRead: Date;
  messageSent: Date;
}
export interface MessageR {
  Id: number;
  SenderId: number;
  SenderKnownAs: string;
  SenderPhotoUrl: string;
  RecipientId: number;
  RecipientKnownAs: string;
  RecipientPhotoUrl: string;
  Content: string;
  IsRead: boolean;
  DateRead: Date;
  MessageSent: Date;
}
