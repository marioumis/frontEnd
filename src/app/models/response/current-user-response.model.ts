export interface CurrentUserResponse {
  id: number;
  login: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: number | null;
  departmentName: string | null;
  roles: string[];
}
