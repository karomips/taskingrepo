import { Component, OnInit } from '@angular/core';
import { SidenavComponent } from "../sidenav/sidenav.component";
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidenavComponent, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
onSidenavHoverChanged($event: boolean) {
throw new Error('Method not implemented.');
}
  tasks: Task[] = [];
  users: User[] = [];
  searchQuery: string = '';
  userMap: { [key: number]: string } = {};
  selectedFilter: string = 'all';
  isSidenavHovered = false;
  showModal = false; // Modal visibility state

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
        this.users = data;
        this.userMap = this.users.reduce((map, user) => {
          map[user.user_id] = user.fullname;
          return map;
        }, {} as { [key: number]: string });
        this.loadTasks(); // Load tasks after users
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
        this.initializeChart();
      },
      error: (error) => {
        console.error('Error fetching tasks:', error);
      }
    });
  }

  initializeChart() {
    const canvas = document.getElementById('taskChart') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Completed', 'In Progress', 'Pending'],
            datasets: [{
              label: '# of Tasks',
              data: [
                this.getCompletedTasksCount(),
                this.getInProgressTasksCount(),
                this.tasks.length - (this.getCompletedTasksCount() + this.getInProgressTasksCount())
              ],
              backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: true
              }
            }
          }
        });
      }
    }
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

  // Helper methods for task counts
  getCompletedTasksCount(): number {
    return this.tasks.filter(task => 
      task.status.toLowerCase() === 'completed'
    ).length;
  }

  getInProgressTasksCount(): number {
    return this.tasks.filter(task => 
      task.status.toLowerCase() === 'in progress'
    ).length;
  }

  // Filter methods
  setFilter(filter: string) {
    this.selectedFilter = filter;
  }

  getFilteredTasks(): Task[] {
    let filtered = this.tasks;

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.task_name.toLowerCase().includes(query) ||
        task.task_description.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(task =>
        task.status.toLowerCase() === this.selectedFilter.toLowerCase()
      );
    }

    return filtered;
  }

  // Format assignee display
  getAssigneeInitial(assignedTo: number): string {
    // You might want to replace this with actual user data lookup
    return assignedTo.toString().charAt(0);
  }

  // Navigation method
  navigateToTask(taskId: number) {
    this.router.navigate(['/task', taskId]);
  }

  openTaskModal() {
    this.showModal = true;
  }
  
  closeModal() {
    this.showModal = false;
  }
}
