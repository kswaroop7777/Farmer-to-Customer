import { Injectable } from '@angular/core';
import { ApiResponse, Category, FarmerProduct, LoginRequest, LoginResponse, Product, RegisterResponse, Role, UserRegister } from '../Interfaces/LoginUser';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MasterService {

  private base = 'https://feestracking.freeprojectapi.com/api';
  onLogin$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  /* ============ USERS ============ */
  userLogin(data: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.base}/farmerUsers/login`, data);
  }

  userRegister(data: UserRegister) {
    return this.http.post<RegisterResponse>(`${this.base}/farmerUsers/create-user`, data);
  }

  /* ============ ROLES ============ */
  getRolesList() {
    return this.http.get<ApiResponse>(`${this.base}/farmerRoles/get-all-roles`);
  }

  createRole(data: Role) {
    return this.http.post<ApiResponse>(`${this.base}/farmerRoles/create-role`, data);
  }

  updateRole(roleId: number, data: Role) {
    return this.http.put<ApiResponse>(`${this.base}/farmerRoles/update-role/${roleId}`, data);
  }

  /* ============ CATEGORIES ============ */
  getCategoriesList() {
    return this.http.get<ApiResponse>(`${this.base}/farmerCategories/get-all-categories`);
  }

  createCategory(data: Category) {
    return this.http.post<ApiResponse>(`${this.base}/farmerCategories/create-category`, data);
  }

  updateCategory(categoryId: number, data: Category) {
    return this.http.put<ApiResponse>(`${this.base}/farmerCategories/update-category/${categoryId}`, data);
  }

  /* ============ MASTER PRODUCTS ============ */
  createProduct(data: Product) {
    return this.http.post<ApiResponse>(`${this.base}/farmerProducts/create-product`, data);
  }

  getAllProducts() {
    return this.http.get<ApiResponse>(`${this.base}/farmerProducts/get-all-products-with-joins`);
  }

  updateProduct(productId: number, data: Product) {
    return this.http.put<ApiResponse>(`${this.base}/farmerProducts/update-product/${productId}`, data);
  }

  /* ============ FARMER PRODUCTS ============ */
  createFarmerProduct(data: FarmerProduct) {
    return this.http.post<ApiResponse>(`${this.base}/farmerFarmerProducts/create-farmer-product`, data);
  }

  getFarmerProducts() {
    return this.http.get<ApiResponse>(`${this.base}/farmerFarmerProducts/get-all-farmer-products-with-joins`);
  }

  updateFarmerProduct(farmerProductId: number, data: FarmerProduct) {
    return this.http.put<ApiResponse>(`${this.base}/farmerFarmerProducts/update-farmer-product/${farmerProductId}`, data);
  }
}
