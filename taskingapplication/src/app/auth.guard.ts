import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private dataService: DataService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const routeurl: string = state.url;
    return this.isLogin(routeurl);
  }

  // Check if the user is logged in
  isLogin(routeurl: string): boolean {
    if (this.dataService.isLoggedIn()) {
      return true;  // User is logged in, allow access
    }

    // If not logged in, store the attempted URL and redirect to login page
    this.dataService.redirectUrl = routeurl;
    this.router.navigate(['/login'], { queryParams: { returnUrl: routeurl } });
    
    return false;  // Block access to the route
  }
}