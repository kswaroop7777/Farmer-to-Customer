import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router=inject(Router)
  const isLogin = localStorage.getItem('khetlyUser')
  if (isLogin == null){
    router.navigateByUrl('/login')
    return false
  }else{
    return true
  }

};
