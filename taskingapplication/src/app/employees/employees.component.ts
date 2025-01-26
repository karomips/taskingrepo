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
  progress?: number;  // Optional field
  file_attachment?: string;  // Optional field
  admin_comments?: string;  // Optional field
}

interface TaskFile {
  id: number;
  task_id: number;
  filename: string;
  filepath: string;
  upload_date: string;
}


interface User {
  user_id: number;
  fullname: string;
  email: string;
  contact_number: string;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  civil_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  gender: 'Male' | 'Female' | 'Other';
  department: string;
  position: string;
  profile_picture: string;
  created_at: string;
  status: 'Active' | 'Inactive';
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
  selectedUserTaskFiles: any[] = [];

  taskModalVisible: boolean = false;
  selectedTask: Task | null = null;
  newComment: string = '';
  taskComments: string[] = [];
  defaultProfileImage: string = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSIzNSIgcj0iMjUiIGZpbGw9IiNlMWUxZTEiLz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjEwMCIgcj0iNDUiIGZpbGw9IiNlMWUxZTEiLz4KPC9zdmc+';

  searchTerm: string = '';
  statusFilter: string = 'all';
  departmentFilter: string = 'all';
  filteredUsers: User[] = [];

  departments: string[] = [
    'Human Resources',
    'Information Technology',
    'Marketing',
    'Finance',
    'Operations',
    'Sales'
];

inactivityReasons: string[] = [
  'Resignation/Termination',
  'Long-term Absence',
  'Retirement',
  'Project Completion',
  'Non-compliance/Violation',
  'Departmental Restructuring',
  'Leave of Absence'
];

reason: string = '';
showReasonDropdown: boolean = false;  // To control the dropdown visibility
showConfirmationModal: boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  selectEmployee(user: User): void {
    this.selectedUser = user;
    this.fetchTasksForUser(user.user_id);
    this.fetchDocumentsForUser(user.user_id);
}


loadUsers(): void {
  this.dataService.getUsers().subscribe(
      (users: User[]) => {
          this.users = users;
          this.filterEmployees(); // Apply filters immediately
      },
      error => {
          console.error('Error loading users:', error);
      }
  );
}

filterEmployees(): void {
  let filtered = [...this.users];

  // Apply search filter
  if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
          user.fullname.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.position.toLowerCase().includes(searchLower)
      );
  }

  // Apply status filter
  if (this.statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === this.statusFilter);
  }

  // Apply department filter
  if (this.departmentFilter !== 'all') {
      filtered = filtered.filter(user => user.department === this.departmentFilter);
  }

  this.filteredUsers = filtered;
}

private searchTimeout: any;
onSearchChange(): void {
    // Clear the existing timeout
    if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
    }

    // Set a new timeout to prevent too many filter operations
    this.searchTimeout = setTimeout(() => {
        this.filterEmployees();
    }, 300);
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
    this.fetchTaskFilesForUser(user.user_id);
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

  fetchTaskFilesForUser(userId: number): void {
    this.dataService.fetchUserTaskFiles(userId).subscribe(
      (taskFiles) => {
        this.selectedUserTaskFiles = taskFiles;  // Store the fetched task files
      },
      (error) => {
        console.error('Error fetching task files:', error);
        this.selectedUserTaskFiles = [];  // Fallback to empty array
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

  downloadTaskFile(fileId: number, filename: string): void {
    this.dataService.downloadTaskFile(fileId).subscribe({
      next: (blob: Blob) => {
        // Create a URL for the blob and set up the download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Encode the filename to handle any special characters/spaces
        link.download = encodeURIComponent(filename);
  
        // Append the link to the document, trigger the click event, then remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Revoke the object URL to free up memory
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading task file:', error);
        alert(`Failed to download task file: ${error.message}`);
      }
    });
  }

  
  
  // Method to handle the status toggle
  updateStatus(userId: number | undefined, currentStatus: 'Active' | 'Inactive'): void {
    if (userId === undefined) {
      console.error('User ID is undefined');
      return; // Exit early if userId is undefined
    }
  
    if (currentStatus === 'Active') {
      this.showReasonDropdown = true;
    } else if (currentStatus === 'Inactive') {
      this.confirmInactivation(userId);
    }
  }
  
  

  // Method to confirm the status change
  confirmInactivation(userId: number): void {
    if (this.reason) {
      // Confirm inactivation with the selected reason
      const confirmation = window.confirm(`Are you sure you want to set this employee's status to Inactive for the reason: "${this.reason}"?`);
      if (confirmation) {
        // Update the user's status to inactive along with the reason
        this.dataService.updateUserStatus(userId, 'Inactive', this.reason).subscribe({
          next: (response) => {
            if (response.success) {
              alert('Status updated successfully');
              this.selectedUser!.status = 'Inactive';  // Update local status
            } else {
              alert('Failed to update status');
            }
          },
          error: (error) => {
            console.error('Error updating status:', error);   
            alert('Error updating status');
          }
        });
      }
    } else {
      alert('Please select a reason for inactivation.');
    }
  }
  
  

  closeReasonDropdown(): void {
    this.showReasonDropdown = false;
  }

  // Method to handle reason selection
// Method to handle reason selection
selectReason(reason: string): void {
  this.reason = reason;  // Store the selected reason
  this.showReasonDropdown = false;  // Close the dropdown after selecting a reason
  
  // Now, change the status to "Inactive" with the selected reason
  this.confirmInactivation(this.selectedUser!.user_id);  // Call the confirmation method with the selected user ID
}

getProfileImage(user: User): string {
    return user.profile_picture || this.defaultProfileImage;
  }
}