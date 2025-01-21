import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from "../sidenav/sidenav.component";
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  user_id: number;
  fullname: string;
  email: string;
  contact_number: string;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  civil_status: string;
  gender: string;
  department: string;
  position: string;
  profile_picture: string;
  created_at: string;
  status: string;
}

interface Task {
  id: number;
  task_name: string;
  task_description: string;
  task_instructions: string;
  due_date: string;
  status: string;
  assigned_to: number;
  department: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  progress?: string;
  file_attachment?: string;
  assigned_users?: { id: number; name: string }[];
  current_time?: string;
  current_user?: string;
}

@Component({
  selector: 'app-tasking',
  standalone: true,
  imports: [SidenavComponent, CommonModule, FormsModule],
  templateUrl: './tasking.component.html',
  styleUrls: ['./tasking.component.css']
})
export class TaskingComponent implements OnInit {

  tasks: Task[] = [];
  users: User[] = [];
  showModal = false;
  selectedTask: Task | null = null;
  selectedFilter: string = 'all';
  searchQuery: string = '';
  userMap: { [key: number]: string } = {}; // Changed to store only fullname
  isSidenavHovered = false;


  constructor(
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadTasks();
    this.loadUsers();
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  }

  onSidenavHoverChanged(isHovered: boolean): void {
    this.isSidenavHovered = isHovered;
  }

  loadUsers() {
    this.dataService.getUsers().subscribe({
      next: (users: any[]) => {
        this.users = users;
        this.userMap = users.reduce((map, user) => {
          map[user.user_id] = user.fullname;
          return map;
        }, {} as { [key: number]: string });
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }

  loadTasks() {
    this.dataService.getTasks().subscribe({
      next: (data: Task[]) => {
        const taskMap: { [key: string]: Task } = {};
  
        data.forEach(task => {
          // Generate a unique key based on common task properties
          const key = `${task.task_name}-${task.task_description}-${task.task_instructions}-${task.due_date}-${task.status}`;
  
          if (taskMap[key]) {
            // Merge assigned_users for tasks with the same key
            taskMap[key].assigned_users = [
              ...(taskMap[key].assigned_users || []),
              ...(task.assigned_users || []),
            ];
          } else {
            // Initialize the task in the map
            taskMap[key] = { ...task, assigned_users: [...(task.assigned_users || [])] };
          }
        });
  
        // Convert the grouped tasks object back into an array
        this.tasks = Object.values(taskMap);
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);
      }
    });
  }
  

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'in progress':
        return 'status-progress';
      case 'completed':
        return 'status-completed';
      default:
        return '';
    }
  }

  setFilter(filter: string) {
    this.selectedFilter = filter;
  }

  getFilteredTasks(): Task[] {
    let filtered = this.tasks;
  
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.task_name.toLowerCase().includes(query) ||
        task.task_description.toLowerCase().includes(query)
      );
    }

    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(task =>
        task.status.toLowerCase() === this.selectedFilter.toLowerCase()
      );
    }
  
    return filtered;
  }

  viewTask(task: Task) {
    this.selectedTask = task;
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
    this.selectedTask = null;
  }
}