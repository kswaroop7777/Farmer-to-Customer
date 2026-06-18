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

export interface ApiResponse {
  result:boolean;
  message:string;
  data?:any
}

export interface Role {
  roleId: number;
  roleName: string;
}

export interface Category {
  categoryId: number;
  name: string;
}

export interface Product {
  productId: number;
  name: string;
  categoryId: number;
  description: string;
  image: string;
  categoryName?: string;
}

export interface FarmerProduct {
  farmerProductId: number;
  farmerId: number;
  productId: number;
  pricePerKg: number;
  availableQuantity: number;
  availableDate: string;
  status: string;
  farmerName?: string;
  productName?: string;
  categoryName?: string;
  image?: string;
}