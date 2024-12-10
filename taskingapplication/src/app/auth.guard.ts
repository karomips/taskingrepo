import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    
    // Check if the user is authenticated (you can store a token in localStorage/sessionStorage)
    const isAuthenticated = localStorage.getItem('authToken') ? true : false;

    if (isAuthenticated) {
      return true; // Allow access
    } else {
      this.router.navigate(['/login']); // Redirect to login if not authenticated
      return false;
    }
  }
}
