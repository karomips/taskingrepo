import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { TaskingComponent } from './tasking/tasking.component';
import { NgModule } from '@angular/core';
import { SignoutComponent } from './signout/signout.component';
import { CommonModule } from '@angular/common';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route for the home page
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'tasking', component: TaskingComponent },
    { path: 'signout', component: SignoutComponent },
      ];
    

@NgModule({
    imports: [RouterModule.forRoot(routes), CommonModule],
    exports: [RouterModule, CommonModule]
  })
  export class AppRoutingModule { }