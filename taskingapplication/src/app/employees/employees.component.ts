import { Component } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmailService } from '../email.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  inactivity_reason?: string; // Add this line
}

interface GroupedUsers {
  [key: string]: User[];
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
selectedReportType: string = '';
currentUser: string = 'admin';
currentDateTime: string = new Date().toLocaleString();

  constructor(
    private dataService: DataService,
    private emailService: EmailService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  viewReport() {
    if (!this.selectedReportType) return;
    
    const doc = new jsPDF();
    let title = '';
    let data: any[] = [];
  
    switch (this.selectedReportType) {
      case 'department':
        title = 'Employees by Department Report';
        // Group users by department
        const departmentGroups = this.groupByDepartment(this.users);
        data = Object.entries(departmentGroups).flatMap(([dept, users]) => 
          users.map(user => ({...user}))
        );
        break;
  
      case 'civilStatus':
        title = 'Employees by Civil Status Report';
        // Group users by civil status
        const statusGroups = this.groupByCivilStatus(this.users);
        data = Object.entries(statusGroups).flatMap(([status, users]) => 
          users.map(user => ({...user}))
        );
        break;
  
      case 'active':
        title = 'Active Employees Report';
        data = this.users.filter(user => user.status === 'Active');
        break;
  
      case 'inactive':
        title = 'Inactive Employees Report';
        data = this.users.filter(user => user.status === 'Inactive');
        break;
    }
  
    console.log('Report data:', data); // Debug log
    this.generatePDFContent(doc, title, data, true);
  }

  generateReport() {
    if (!this.selectedReportType) {
      console.log('No report type selected');
      return;
    }
  
    console.log('Current users data:', this.users); // Debug log

    const doc = new jsPDF();
    let title = '';
    let data: any[] = [];
  
    switch (this.selectedReportType) {
      case 'department':
        title = 'Employees by Department Report';
        const departmentGroups = this.groupByDepartment(this.users);
        console.log('Department groups:', departmentGroups); // Debug log
        data = this.formatDepartmentData(departmentGroups);
        break;
        
      case 'civilStatus':
        title = 'Employees by Civil Status Report';
        const statusGroups = this.groupByCivilStatus(this.users);
        console.log('Civil status groups:', statusGroups); // Debug log
        data = this.formatCivilStatusData(statusGroups);
        break;
  
      case 'active':
        title = 'Active Employees Report';
        data = this.users.filter(user => user.status === 'Active');
        break;
  
      case 'inactive':
        title = 'Inactive Employees Report';
        data = this.users.filter(user => user.status === 'Inactive');
        break;
    }
  
console.log('Formatted data:', data); // Debug log
  this.generatePDFContent(doc, title, data, false);
  }

  private generatePDFContent(doc: jsPDF, title: string, data: any[], isPreview: boolean) {
    if (!data || data.length === 0) {
      console.log('No data available for the report');
      alert('No data available for the report');
      return;
    }
  
    // Current user and timestamp
    const currentUser = 'Admin';
    const currentDateTime = new Date().toLocaleString();
  
    // Add report title
    doc.setFontSize(16);
    doc.text(title, 105, 25, { align: 'center' });
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Generated by: ${currentUser}`, 14, 35);
    doc.text(`Date: ${currentDateTime}`, 14, 40);
  
    // Define columns based on report type
    let columns: string[];
    let formattedData: any[];
  
    switch (this.selectedReportType) {
      case 'department':
        columns = ['Department', 'Name', 'Position', 'Status', 'Inactivity Reason'];
        formattedData = data.map(user => [
          user.department,
          user.fullname,
          user.position,
          user.status,
          user.status === 'Inactive' ? (user.inactivity_reason || 'N/A') : 'N/A'
        ]);
        break;
      case 'civilStatus':
        columns = ['Civil Status', 'Name', 'Department', 'Position', 'Status', 'Inactivity Reason'];
        formattedData = data.map(user => [
          user.civil_status,
          user.fullname,
          user.department,
          user.position,
          user.status,
          user.status === 'Inactive' ? (user.inactivity_reason || 'N/A') : 'N/A'
        ]);
        break;
      default:
        columns = ['Name', 'Department', 'Position', 'Status', 'Inactivity Reason'];
        formattedData = data.map(user => [
          user.fullname,
          user.department,
          user.position,
          user.status,
          user.status === 'Inactive' ? (user.inactivity_reason || 'N/A') : 'N/A'
        ]);
    }
  
    // Add table
    autoTable(doc, {
      head: [columns],
      body: formattedData,
      startY: 45,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 45 }
    });
  
    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  
    if (isPreview) {
      window.open(URL.createObjectURL(doc.output('blob')));
    } else {
      const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    }
  }

  private getTableHeaders(): string[] {
    switch (this.selectedReportType) {
      case 'department':
        return ['Department', 'Name', 'Position', 'Status', 'Inactivity Reason'];
      case 'civilStatus':
        return ['Civil Status', 'Name', 'Department', 'Position', 'Status', 'Inactivity Reason'];
      default:
        return ['Name', 'Email', 'Department', 'Position', 'Status', 'Inactivity Reason'];
    }
  }

  private getTableData(data: any[]): any[][] {
    switch (this.selectedReportType) {
      case 'active':
      case 'inactive':
        return data.map(user => [
          user.fullname,
          user.email,
          user.department,
          user.position,
          user.status,
          user.status === 'Inactive' ? (user.inactivity_reason || 'No reason provided') : 'N/A'
        ]);
      case 'department':
        return this.formatDepartmentData(this.groupByDepartment(data));
      case 'civilStatus':
        return this.formatCivilStatusData(this.groupByCivilStatus(data));
      default:
        return [];
    }
  }

  private groupByDepartment(users: User[]): { [key: string]: User[] } {
    return users.reduce((groups: { [key: string]: User[] }, user: User) => {
      const department = user.department || 'Unassigned';
      groups[department] = groups[department] || [];
      groups[department].push(user);
      return groups;
    }, {});
  }
  
  private groupByCivilStatus(users: User[]): { [key: string]: User[] } {
    return users.reduce((groups: { [key: string]: User[] }, user: User) => {
      const status = user.civil_status || 'Unknown';
      groups[status] = groups[status] || [];
      groups[status].push(user);
      return groups;
    }, {});
  }

  private formatDepartmentData(groups: GroupedUsers): any[][] {
    const data: any[][] = [];
    
    Object.entries(groups).forEach(([dept, groupUsers]) => {
      if (dept && groupUsers && groupUsers.length > 0) {
        groupUsers.forEach((user: User) => {
          data.push([
            dept,
            user.fullname,
            user.position || 'N/A',
            user.status,
            user.status === 'Inactive' ? (user.inactivity_reason || 'No reason provided') : 'N/A'
          ]);
        });
      }
    });
  
    console.log('Formatted department data:', data); // Debug log
    return data;
  }
  
  private formatCivilStatusData(groups: GroupedUsers): any[][] {
    const data: any[][] = [];
    
    Object.entries(groups).forEach(([status, groupUsers]) => {
      if (status && groupUsers && groupUsers.length > 0) {
        groupUsers.forEach((user: User) => {
          data.push([
            status,
            user.fullname,
            user.department || 'N/A',
            user.position || 'N/A',
            user.status,
            user.status === 'Inactive' ? (user.inactivity_reason || 'No reason provided') : 'N/A'
          ]);
        });
      }
    });
  
    console.log('Formatted civil status data:', data); // Debug log
    return data;
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
      this.selectedUserTasks = tasks;
    },
    error => {
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
      return;
    }
  
    if (currentStatus === 'Active') {
      // If changing from Active to Inactive, show reason dropdown
      this.showReasonDropdown = true;
      this.reason = ''; // Reset the reason
    } else {
      // If changing from Inactive to Active
      const confirmation = window.confirm('Are you sure you want to set this employee\'s status to Active?');
      if (confirmation) {
        this.dataService.updateUserStatus(userId, 'Active').subscribe({
          next: (response) => {
            if (response.success) {
              // Update the local user object
              if (this.selectedUser) {
                this.selectedUser.status = 'Active';
                this.selectedUser.inactivity_reason = undefined; // Clear the inactivity reason
              }
              // Find and update the user in the filtered list
              const user = this.filteredUsers.find(u => u.user_id === userId);
              if (user) {
                user.status = 'Active';
                user.inactivity_reason = undefined;
              }
              this.loadUsers(); // Reload the users to refresh the data
              alert('Status updated successfully');
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
    }
  }

  // Method to confirm the status change
  confirmInactivation(userId: number): void {
    if (!this.reason) {
      alert('Please select a reason for inactivation.');
      return;
    }

    const confirmation = window.confirm(`Are you sure you want to set this employee's status to Inactive for the reason: "${this.reason}"?`);
    if (confirmation) {
      this.dataService.updateUserStatus(userId, 'Inactive', this.reason).subscribe({
        next: (response) => {
          if (response.success) {
            // Update the local user object
            if (this.selectedUser) {
              this.selectedUser.status = 'Inactive';
              this.selectedUser.inactivity_reason = this.reason;
            }
            // Find and update the user in the filtered list
            const user = this.filteredUsers.find(u => u.user_id === userId);
            if (user) {
              user.status = 'Inactive';
              user.inactivity_reason = this.reason;
            }
            this.loadUsers(); // Reload the users to refresh the data
            this.showReasonDropdown = false;
            this.reason = '';
            alert('Status updated successfully');

            // Send email notification
            this.sendInactivationEmail(this.selectedUser);
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
  }

  sendInactivationEmail(user: any): void {
    const customMessage = `Reason for inactivation: ${this.reason}`;
    this.emailService.sendInactiveEmail({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    }, customMessage).subscribe({
      next: () => {
        console.log('Email sent successfully');
      },
      error: (error) => {
        console.error('Error sending email:', error);
      }
    });
  }
  
  closeReasonDropdown(): void {
    this.showReasonDropdown = false;
  }

// Method to handle reason selection
selectReason(reason: string): void {
  this.reason = reason;  // Store the selected reason
  this.showReasonDropdown = false;  // Close the dropdown after selecting a reason
  
  // Change the status to "Inactive" with the selected reason
  this.confirmInactivation(this.selectedUser!.user_id);  // Call the confirmation method with the selected user ID
}

getProfileImage(user: User): string {
    return user.profile_picture || this.defaultProfileImage;
  }
}