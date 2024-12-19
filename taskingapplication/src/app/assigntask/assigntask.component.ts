import { Component } from '@angular/core';
import { SidenavComponent } from "../sidenav/sidenav.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

interface User {
  user_id: number;
  fullname: string;
}

@Component({
  selector: 'app-assigntask',
  imports: [SidenavComponent, FormsModule, CommonModule],
  templateUrl: './assigntask.component.html',
  styleUrls: ['./assigntask.component.css']
})
export class AssigntaskComponent {

  users: any[] = [];
  task: any = {
    taskName: '',
    taskDescription: '',
    taskInstructions: '',
    dueDate: '',
    assignedTo: null,
    createdBy: null
  };
  showSuccessModal = false;
  showFailureModal = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.setCreatedBy(); // Automatically set the admin user ID
  }

  loadUsers() {
    // Assume you have a service to load the list of users
    this.dataService.getUsers().subscribe((response) => {
      this.users = response;
    });
  }

  setCreatedBy() {
    // Fetch the logged-in admin ID (this can be from session storage, a service, or other means)
    const loggedInAdminId = 1; // Replace with actual logic to fetch admin's ID
    this.task.createdBy = loggedInAdminId;
  }

  submitTask() {
    this.dataService.assignTask(this.task).subscribe(
      (response) => {
        if (response.success) {
          this.showSuccessModal = true;
        } else {
          this.showFailureModal = true;
        }
      },
      (error) => {
        this.showFailureModal = true;
      }
    );
  }

  closeModal() {
    this.showSuccessModal = false;
    this.showFailureModal = false;
  }
}