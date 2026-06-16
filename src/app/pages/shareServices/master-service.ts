import { Injectable } from '@angular/core';
import { ApiResponse, Category, LoginRequest, LoginResponse, RegisterResponse, Role, UserRegister } from '../Interfaces/LoginUser';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MasterService {

  constructor(private http: HttpClient) {}

  userLogin(data: LoginRequest) {
    return this.http.post<LoginResponse>('https://feestracking.freeprojectapi.com/api/farmerUsers/login', data);
  }

  userRegister(data: UserRegister) {
    return this.http.post<RegisterResponse>('https://feestracking.freeprojectapi.com/api/farmerUsers/create-user', data);
  }

  getRolesList(){
    return this.http.get<ApiResponse>('https://feestracking.freeprojectapi.com/api/farmerRoles/get-all-roles')
  }

  createRole(data: Role) {
    return this.http.post<ApiResponse>('https://feestracking.freeprojectapi.com/api/farmerRoles/create-role', data);
  }
   updateRole(roleId:number, data:Role){
    return this.http.post<ApiResponse>(`https://feestracking.freeprojectapi.com/api/farmerCategories/update-role/${roleId}`,data)
  }

  getCategoriesList() {
    return this.http.get<ApiResponse>('https://feestracking.freeprojectapi.com/api/farmerCategories/get-all-categories');
  }

  createCategory(data: Category) {
    return this.http.post<ApiResponse>('https://feestracking.freeprojectapi.com/api/farmerCategories/create-category', data);
  }

  updateCategory(categoryId: number,data:Category){
    return this.http.post<ApiResponse>(`https://feestracking.freeprojectapi.com/api/farmerCategories/update-category/${categoryId}`,data)
  }
 
}
