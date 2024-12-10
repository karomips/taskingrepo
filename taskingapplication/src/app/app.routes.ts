import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { TaskingComponent } from './tasking/tasking.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './auth.guard';  // Import the AuthGuard
import { AssigntaskComponent } from './assigntask/assigntask.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },  // Default route
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'tasking', component: TaskingComponent },
  { path: 'assigntask', component: AssigntaskComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule],
  exports: [RouterModule, CommonModule]
})
export class AppRoutingModule { }
