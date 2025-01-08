import { Component } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';

interface Task {
    id: number;
    task_name: string;
    task_description: string;
    due_date: string;
    status: string;
    assigned_to: number;
    created_by: number;

}

interface User {
  user_id: number;
  fullname: string;
  profile_picture: string;
  department: string;
  // Remove the tasks field here if it's not part of the fetched user data
  tasks?: Task[];  // Mark tasks as optional
}



@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [SidenavComponent, CommonModule],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent {

  users: User[] = [];  // Array to store user data
  modalVisible: boolean = false;  // Flag to control modal visibility
  selectedUser: User | null = null;  // Object to hold selected user data
  selectedUserTasks: Task[] = [];  // Array to store tasks assigned to the selected user
  selectedUserDocuments: any[] = [];  // Array to store documents for the selected user


  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadUsers();  // Load users when component initializes
  }

  // Load users from the DataService
  loadUsers(): void {
    this.dataService.getUsers().subscribe(
      (users: User[]) => {
        console.log('Fetched users:', users); // Check the full URLs
        this.users = users; // Now it will accept users without 'tasks'
      },
      error => {
        console.error('Error loading users:', error);
      }
    );
  }
  

  // Method to open the modal with the selected user's details
  openModal(user: User): void {
    console.log("Opening modal for user:", user);
    this.selectedUser = user;
    this.modalVisible = true;
    
    // Fetch tasks and documents for the selected user
    this.fetchTasksForUser(user.user_id);
    this.fetchDocumentsForUser(user.user_id);
  }
  
  fetchDocumentsForUser(userId: number): void {
    this.dataService.fetchUserDocuments(userId).subscribe(
      (documents) => {
        console.log('Documents for user', userId, ':', documents);  // Log documents fetched
        this.selectedUserDocuments = documents;  // Store documents
      },
      (error) => {
        console.error('Error fetching documents:', error);
        this.selectedUserDocuments = [];  // Clear documents in case of an error
      }
    );
  }
  

  // Fetch tasks assigned to the selected user
  fetchTasksForUser(userId: number): void {
    this.dataService.fetchUserTasks(userId).subscribe(
      (tasks) => {
        this.selectedUserTasks = tasks;  // Store the tasks in the selectedUserTasks array
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        this.selectedUserTasks = [];  // Clear tasks in case of an error
      }
    );
  }

  // Method to close the modal
  closeModal(): void {
    this.modalVisible = false;  // Hide the modal
    this.selectedUser = null;   // Clear the selected user
    this.selectedUserTasks = [];  // Clear tasks for the user
  }

  onSidenavHover(isHovered: boolean): void {
    console.log('Sidenav hover state changed:', isHovered);
  }
}