import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from "../sidenav/sidenav.component";
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Task {
  id: number;
  task_name: string;
  task_description: string;
  due_date: string;
  status: string;
  assigned_to: number;
  created_by: number;
}

@Component({
  selector: 'app-tasking',
  standalone: true,
  imports: [SidenavComponent, CommonModule, FormsModule],
  templateUrl: './tasking.component.html',
  styleUrls: ['./tasking.component.css']
})
export class TaskingComponent implements OnInit {
taskDescription: any;
formatDate(arg0: any) {
throw new Error('Method not implemented.');
}
isSidenavHovered: any;
userTasks: any;
onSidenavHoverChanged($event: boolean) {
throw new Error('Method not implemented.');
}
  tasks: Task[] = [];
  showModal = false;
  selectedFilter: string = 'all';
  searchQuery: string = '';
  userMap: { [key: number]: string } = {};

  constructor(
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadTasks();
    this.loadUsers();
  }

  loadUsers() {
    this.dataService.getUsers().subscribe({
      next: (data) => {
        this.userMap = data.reduce((map, user) => {
          map[user.id] = user.fullname;
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
      next: (data) => {
        this.tasks = data;
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);
      }
    });
  }

  getAssigneeName(assigned_to: number): string {
    return this.userMap[assigned_to] || 'Unknown';
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

  openModal(task: Task) {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
