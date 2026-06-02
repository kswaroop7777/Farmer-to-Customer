import { Injectable } from '@angular/core';
import { LoginRequest, LoginResponse, RegisterResponse, UserRegister } from '../Interfaces/LoginUser';
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
}
