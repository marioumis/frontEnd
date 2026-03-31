export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  login: string;
  departmentId?: number;
}