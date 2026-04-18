export interface InvitationResponse {
  id: number;
  email: string;
  role: string;
  departmentId?: number;
  departmentName?: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  activationKeyExpires: string;
  activationKey: string;
  inviterEmail: string;
}
