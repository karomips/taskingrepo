import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { TaskingComponent } from './tasking/tasking.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './auth.guard';  // Import the AuthGuard
import { AssigntaskComponent } from './assigntask/assigntask.component';
import { FormsModule } from '@angular/forms';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },  // Protected route
  { path: 'login', component: LoginComponent },
  { path: 'tasking', component: TaskingComponent, canActivate: [AuthGuard] },  // Protected route
  { path: 'assigntask', component: AssigntaskComponent, canActivate: [AuthGuard] }  // Protected route
];

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule, FormsModule],
  exports: [RouterModule, CommonModule]
})
export class AppRoutingModule { }
