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
openEmployeeTaskModal() {
throw new Error('Method not implemented.');
}
onSidenavHoverChanged($event: boolean) {
throw new Error('Method not implemented.');
}
  tasks: Task[] = [];
  users: User[] = [];
  searchQuery: string = '';
  userMap: { [key: number]: string } = {};
  selectedFilter: string = 'all';
  isSidenavHovered = false;
  showModal = false;
  timelineChart: any;


  constructor(
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadTasks();
    this.loadUsers();
    this.initializeTimelineChart(); // Add this
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
                display: true,
                position: 'top',
                labels: {
                  color: 'white',
                  font: {
                    size: 16  // Bigger legend text
                  },
                  padding: 20  // More spacing between legend items
                }
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
    console.log('Modal opened:', this.showModal); // Debug log
  }

  closeModal() {
    this.showModal = false;
    console.log('Modal closed:', this.showModal); // Debug log
  }

  initializeTimelineChart() {
    this.dataService.getTasksByDate().subscribe(data => {
      const canvas = document.getElementById('tasksTimelineChart') as HTMLCanvasElement;
      if (canvas && data.length > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (this.timelineChart) {
            this.timelineChart.destroy();
          }
  
          this.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: data.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }),
              datasets: [{
                label: 'Tasks Created',
                data: data.map(item => item.count),
                fill: true,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                tension: 0.4,
                borderWidth: 3,  // Thicker lines
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,  // Bigger points
                pointRadius: 6,       // Bigger points
                pointHoverRadius: 8   // Bigger hover points
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  labels: {
                    color: 'white',
                    font: {
                      size: 16,    // Bigger legend text
                      weight: 'bold'  // Fixed: Using valid font weight
                    },
                    padding: 20    // More spacing
                  }
                },
                title: {
                  display: true,
                  text: 'Tasks Created (Last 7 Days)',
                  color: 'white',
                  font: {
                    size: 20,      // Bigger title
                    family: 'Poppins',
                    weight: 'bold'  // Fixed: Using valid font weight
                  },
                  padding: 20
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                    color: 'white',
                    font: {
                      size: 14     // Bigger axis labels
                    },
                    padding: 10
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    lineWidth: 1
                  }
                },
                x: {
                  ticks: {
                    color: 'white',
                    font: {
                      size: 14     // Bigger axis labels
                    },
                    padding: 10
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    lineWidth: 1
                  }
                }
              }
            }
          });
        }
      }
    });
  
}
}
