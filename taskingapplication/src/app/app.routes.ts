import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { TaskingComponent } from './tasking/tasking.component';
import { AssigntaskComponent } from './assigntask/assigntask.component';
import { EmployeesComponent } from './employees/employees.component';
import { ApplicantsComponent } from './applicants/applicants.component';
import { MessageComponent } from './message/message.component';
import { AuthGuard } from './auth.guard'; // Import the AuthGuard
import { TaskDetailsComponent } from './task-details/task-details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, // Protected route
  { path: 'login', component: LoginComponent },
  { path: 'tasking', component: TaskingComponent, canActivate: [AuthGuard] }, // Protected route
  { path: 'assigntask', component: AssigntaskComponent, canActivate: [AuthGuard] },
  { path: 'employees', component: EmployeesComponent, canActivate: [AuthGuard] }, // Protected route
  { path: 'applicants', component: ApplicantsComponent, canActivate: [AuthGuard] }, // Protected route
  { path: 'message', component: MessageComponent, canActivate: [AuthGuard] }, // Protected route
  { path: 'task-details/:id', component: TaskDetailsComponent, canActivate: [AuthGuard] }, // Add Task Details route
];

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonModule, FormsModule],
  exports: [RouterModule, CommonModule],
})
export class AppRoutingModule {}
