export interface InviteUserRequest {
  email: string;
  roleName: string;
  departmentId?: number | null;
}
