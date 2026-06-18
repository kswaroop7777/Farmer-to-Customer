import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../shareServices/master-service';
import { LoginResponse, RegisterResponse } from '../Interfaces/LoginUser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loginForm: FormGroup;
  registerForm: FormGroup;
  fb = inject(FormBuilder);
  isLoginMode = true;
  showLoginPassword = false;
  showRegisterPassword = false;
  masterSer = inject(MasterService);
  route=inject(Router)
  rolesList:any[]=[]


  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false],
    });

    this.registerForm = this.fb.group({
      userId: [0],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      roleId: [0, [Validators.required, Validators.min(2)]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      lat: [''],
      lang: [''],
      userImge: [''],
      createdAt: [''],
      terms: [false, [Validators.requiredTrue]],
    });
  }

  toggleMode(mode: 'login' | 'register') {
    this.isLoginMode = mode === 'login';
    this.getAllRolesList()
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.masterSer.userLogin(this.loginForm.value).subscribe({
      next: (res: LoginResponse) => {
        const user = (res as any)?.data ?? { email: this.loginForm.value.email };
        localStorage.setItem('khetlyUser', JSON.stringify(user));
        localStorage.setItem('khetlytoken',JSON.stringify(user.token))
        this.masterSer.onLogin$.next(true)
        this.route.navigateByUrl('home');
      },
      error: (err: any) => {
        alert('Wrong credentials');
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const payload = {
      ...this.registerForm.value,
      createdAt: new Date().toISOString(),
    };
    this.masterSer.userRegister(payload).subscribe({
      next: (res: RegisterResponse) => {
        alert('User Registered Successfully');
        this.registerForm.reset({ userId: 0, roleId: 0, terms: false });
        this.toggleMode('login');
      },
      error: (err: any) => {
        alert('Registration Failed');
      }
    });
  }

  getAllRolesList(){
    this.masterSer.getRolesList().subscribe((res:any)=>{
      this.rolesList = res.data;
    });
  }
}
