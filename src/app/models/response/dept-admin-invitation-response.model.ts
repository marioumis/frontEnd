export interface DeptAdminInvitationResponse {
  id: number;
  email: string;
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED' | string;
  sentAt: string;
  expiresAt: string;
  inviterEmail: string;
}
