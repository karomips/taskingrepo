import { Component } from '@angular/core';
import { SidenavComponent } from "../sidenav/sidenav.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { firstValueFrom } from 'rxjs';

interface User {
  user_id: number;
  fullname: string;
  department: string;
}

interface HTMLSelectOption extends HTMLOptionElement {
  value: string;
  text: string;
}

@Component({
  selector: 'app-assigntask',
  imports: [SidenavComponent, FormsModule, CommonModule],
  templateUrl: './assigntask.component.html',
  styleUrls: ['./assigntask.component.css']
})
export class AssigntaskComponent {

  users: User[] = [];
  filteredUsers: User[] = [];
  departments: string[] = [
    'Human Resources',
    'Information Technology',
    'Marketing',
    'Finance',
    'Operations',
    'Sales'
  ];
  task: {
    taskName: string;
    taskDescription: string;
    taskInstructions: string;
    dueDate: string;
    assignedTo: string[]; // Keep as string[] for multiple selections
    createdBy: number | null;
    department: string;
  } = {
    taskName: '',
    taskDescription: '',
    taskInstructions: '',
    dueDate: '',
    assignedTo: [],
    createdBy: null,
    department: ''
  };
  showSuccessModal = false;
  showFailureModal = false;
  isSidenavHovered = false;
  selectedEmployees: string[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.setCreatedBy();
  }

  loadUsers() {
    this.dataService.getUsers().subscribe((response) => {
      this.users = response;
      this.filteredUsers = [];
    });
  }

  onDepartmentChange(selectedDepartment: string) {
    this.task.assignedTo = [];
    this.selectedEmployees = [];
    
    this.filteredUsers = this.users.filter(user => 
      user.department.toLowerCase() === selectedDepartment.toLowerCase()
    );
  }

  onEmployeeSelectionChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(select.selectedOptions) as HTMLSelectOption[];
    
    this.task.assignedTo = selectedOptions.map(option => option.value);
    this.selectedEmployees = selectedOptions.map(option => option.text);
  }

  setCreatedBy() {
    const loggedInAdminId = 1;
    this.task.createdBy = loggedInAdminId;
  }

  async submitTask() {
    if (this.task.assignedTo.length === 0) {
      this.showFailureModal = true;
      return;
    }

    try {
      const assignmentPromises = this.task.assignedTo.map(async (employeeId: string) => {
        const singleTask = {
          taskName: this.task.taskName,
          taskDescription: this.task.taskDescription,
          taskInstructions: this.task.taskInstructions,
          dueDate: this.task.dueDate,
          assignedTo: parseInt(employeeId, 10), // Convert string to number
          createdBy: this.task.createdBy as number,
          department: this.task.department,
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        return await firstValueFrom(this.dataService.assignTask(singleTask));
      });

      await Promise.all(assignmentPromises);
      this.showSuccessModal = true;
      this.resetForm();
    } catch (error) {
      this.showFailureModal = true;
      console.error('Error submitting tasks:', error);
    }
  }

  resetForm() {
    this.task = {
      taskName: '',
      taskDescription: '',
      taskInstructions: '',
      dueDate: '',
      assignedTo: [],
      createdBy: this.task.createdBy,
      department: ''
    };
    this.selectedEmployees = [];
    this.filteredUsers = [];
  }

  closeModal() {
    this.showSuccessModal = false;
    this.showFailureModal = false;
  }

  onHoverStateChanged(isHovered: boolean) {
    this.isSidenavHovered = isHovered;
  }
}