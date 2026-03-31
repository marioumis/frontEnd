export interface AdminUserResponse {
  id: number;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  activated: boolean;
  departmentId: number | null;
  departmentName: string | null;
  roles: string[]; 
}