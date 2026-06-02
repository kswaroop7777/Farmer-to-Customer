export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserRegister {
  userId: number;
  name: string;
  email: string;
  password: string;
  roleId: number;
  phone: string;
  address: string;
  city: string;
  lat: string;
  lang: string;
  userImge: string;
  createdAt: string; 
}

export interface LoginResponse {
  result: boolean;
  message: string;
  data?: any;
}

export interface RegisterResponse {
  result: boolean;
  message: string;
  data?: any;
}
