export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role?: 'member' | 'staff' | 'admin' | 'super_admin' | 'root_admin';
  employeeId?: string;
  position?: string;
  joinDate?: string;
  status?: string;
  profileThumb?: string;
  profilePic?: string;
  firstName?: string;
  lastName?: string;
  userid?: string;
  profile_id?: string;
  isVerified?: string;
  is_visible?: number
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  userRole: string | null; // Add this
  accessToken: string | null;
  isAuthenticated: boolean;
  updateUser: (updatedData: User) => Promise<void>;
  login: (credentials: any) => Promise<{ success: boolean; message?: any }>;
  signup: (userData: any) => Promise<{ success: boolean; message?: any }>;
  logout: () => Promise<{ success: boolean; message?: any }>;
}
