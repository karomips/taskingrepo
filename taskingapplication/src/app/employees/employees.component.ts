import { Component } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Task {
  id: number;
  task_name: string;
  task_description: string;
  task_instructions: string;
  due_date: string;
  status: string;
  assigned_to: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  progress?: string;  // Optional field
  file_attachment?: string;  // Optional field
  admin_comments?: string;  // Optional field
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
  imports: [
    SidenavComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent {

  users: User[] = [];
  modalVisible: boolean = false;
  selectedUser: User | null = null;
  selectedUserTasks: Task[] = [];
  selectedUserDocuments: any[] = [];

  taskModalVisible: boolean = false;
  selectedTask: Task | null = null;
  newComment: string = '';
  taskComments: string[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.dataService.getUsers().subscribe(
      (users: User[]) => {
        this.users = users;
      },
      error => {
        console.error('Error loading users:', error);
      }
    );
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'task-status pending';
      case 'in progress':
        return 'task-status in-progress';
      case 'completed':
        return 'task-status completed';
      default:
        return 'task-status unknown';
    }
  }

  openModal(user: User): void {
    this.selectedUser = user;
    this.modalVisible = true;

    this.fetchTasksForUser(user.user_id);
    this.fetchDocumentsForUser(user.user_id);
  }

  fetchDocumentsForUser(userId: number): void {
    this.dataService.fetchUserDocuments(userId).subscribe(
      (documents) => {
        this.selectedUserDocuments = documents;
      },
      (error) => {
        console.error('Error fetching documents:', error);
        this.selectedUserDocuments = [];
      }
    );
  }

  fetchTasksForUser(userId: number): void {
    this.dataService.fetchUserTasks(userId).subscribe(
      (tasks: Task[]) => {
        // TypeScript will now correctly infer the types
        this.selectedUserTasks = tasks;
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        this.selectedUserTasks = [];
      }
    );
}


  openTaskModal(task: Task): void {
    this.selectedTask = task;
    this.taskComments = task.admin_comments ? task.admin_comments.split('\n') : [];
    this.taskModalVisible = true;
  }

  closeModal(): void {
    this.modalVisible = false;
    this.selectedUser = null;
    this.selectedUserTasks = [];
  }

  closeTaskModal(): void {
    this.taskModalVisible = false;
    this.selectedTask = null;
    this.newComment = '';
  }
  viewDocument(filepath: string): void {
    window.open(filepath, '_blank');  // Opens the document in a new tab
}

  submitComment(): void {
    if (this.newComment.trim()) {
      const updatedComments = [...this.taskComments, this.newComment];
      const updatedAdminComments = updatedComments.join('\n'); // Join comments with newline
  
      // Get the admin ID from the current user or any logic you have for identifying the admin
      const adminId = 1; // You can fetch this dynamically based on logged-in admin
  
      // Update the task's admin_comments field on the server (via the DataService)
      if (this.selectedTask) {
        this.dataService.updateTaskAdminComments(this.selectedTask.id, adminId, this.newComment).subscribe(
          () => {
            // Update the local task object with new admin comments
            this.selectedTask!.admin_comments = updatedAdminComments;
            this.taskComments = updatedComments;
            this.newComment = '';  // Reset the comment input
          },
          (error) => {
            console.error('Error updating admin comments:', error);
          }
        );
      }
    }
  }
  

  onSidenavHover(isHovered: boolean): void {
    console.log('Sidenav hover state changed:', isHovered);
  }
  downloadDocument(fileId: number, filename: string): void {
    this.dataService.downloadDocument(fileId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading document:', error);
        // Add this line to show error to user
        alert(`Failed to download document: ${error.message}`);
      }
    });
  }
}