import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { TaskingComponent } from './tasking/tasking.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './auth.guard';  // Import the AuthGuard
import { AssigntaskComponent } from './assigntask/assigntask.component';
import { FormsModule } from '@angular/forms';
import { EmployeesComponent } from './employees/employees.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ApplicantsComponent } from './applicants/applicants.component';
import { TasklistComponent } from './tasklist/tasklist.component';
import { MessageComponent } from './message/message.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },  // Protected route
  { path: 'login', component: LoginComponent },
  { path: 'tasking', component: TaskingComponent, canActivate: [AuthGuard] },  // Protected route
  { path: 'assigntask', component: AssigntaskComponent, canActivate: [AuthGuard] },  // Protected route
  { path: 'employees', component: EmployeesComponent, canActivate: [AuthGuard] }, // Protected route
  { path: 'applicants', component: ApplicantsComponent, canActivate: [AuthGuard] }, // Protected route
  { path: 'tasklist', component: TasklistComponent, canActivate: [AuthGuard] }, // Protected route
  { path: 'message', component: MessageComponent, canActivate: [AuthGuard] }, // Protected route

];

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule, FormsModule],
  exports: [RouterModule, CommonModule]
})
export class AppRoutingModule { }
