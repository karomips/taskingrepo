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
  status: 'Pending' | 'In Progress' | 'Completed';  // Make this a union type
  assigned_to: number;
  created_by: number;
  department: string;  // Add this property
  progress?: number;   // Add this optional property
}

export interface User {
  id: any;
  user_id: number;
  fullname: string;
  email: string;
  contact_number: string;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  civil_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  gender: 'Male' | 'Female' | 'Other';  // Added gender property
  department: string;  // Added department property
  position: string;   // Added position property
  profile_picture: string;
  created_at: string;
  status: 'Active' | 'Inactive';  // Added status property
}
interface ApplicantCounts {
  [key: string]: number;
}

interface StatusCounts {
  'Pending': number;
  'Under Review': number;
  'Approved': number;
  'Rejected': number;
}

interface GenderCounts {
  'Male': number;
  'Female': number;
  'Other': number;
}

interface CivilStatusCounts {
  'Single': number;
  'Married': number;
  'Divorced': number;
  'Widowed': number;
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
  applicantStatusChart: any;
applicantDemographicsChart: any;
departmentChart: any;
civilStatusChart: any;
applicants: any[] = [];
taskStatusChart: Chart | null = null;
tasksByDepartmentChart: Chart | null = null;
userStatusChart: Chart | null = null;
  userGenderChart: Chart | null = null;
  userDepartmentChart: Chart | null = null;
 

  constructor(
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadTasks();
    this.initializeTimelineChart(); // Add this
    this.loadApplicants();
    this.initializeTaskCharts();
    this.loadUserCharts();

  }

  ngOnDestroy() {
    if (this.applicantStatusChart) this.applicantStatusChart.destroy();
    if (this.applicantDemographicsChart) this.applicantDemographicsChart.destroy();
    if (this.departmentChart) this.departmentChart.destroy();
    if (this.civilStatusChart) this.civilStatusChart.destroy();
    if (this.taskStatusChart) this.taskStatusChart.destroy();
    if (this.tasksByDepartmentChart) this.tasksByDepartmentChart.destroy();
    if (this.userStatusChart) this.userStatusChart.destroy();
    if (this.userGenderChart) this.userGenderChart.destroy();
    if (this.userDepartmentChart) this.userDepartmentChart.destroy();
  }

  private loadUserCharts() {
    this.dataService.getUsers().subscribe(users => {
      this.initializeUserStatusChart(users);
      this.initializeUserGenderChart(users);
      this.initializeUserDepartmentChart(users);
    });
  }

  private initializeUserStatusChart(users: User[]) {
    const statusCounts = {
      Active: users.filter(user => user.status === 'Active').length,
      Inactive: users.filter(user => user.status === 'Inactive').length
    };

    const ctx = document.getElementById('userStatusChart') as HTMLCanvasElement;
    if (ctx) {
      this.userStatusChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Active', 'Inactive'],
          datasets: [{
            data: [statusCounts.Active, statusCounts.Inactive],
            backgroundColor: ['#2ecc71', '#e74c3c'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: 'white' }
            },
            title: {
              display: true,
              text: 'Employees Status Distribution',
              color: 'white'
            }
          }
        }
      });
    }
  }

  private initializeUserGenderChart(users: User[]) {
    const genderCounts = {
      Male: users.filter(user => user.gender === 'Male').length,
      Female: users.filter(user => user.gender === 'Female').length,
      Other: users.filter(user => user.gender === 'Other').length
    };

    const ctx = document.getElementById('userGenderChart') as HTMLCanvasElement;
    if (ctx) {
      this.userGenderChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Male', 'Female', 'Other'],
          datasets: [{
            label: 'Number of Employees',
            data: [genderCounts.Male, genderCounts.Female, genderCounts.Other],
            backgroundColor: ['#3498db', '#e84393', '#95a5a6'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            x: {
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
          },
          plugins: {
            legend: {
              labels: { color: 'white' }
            }
          }
        }
      });
    }
  }

  private initializeUserDepartmentChart(users: User[]) {
    // Group users by department and position
    const departmentData = users.reduce((acc, user) => {
      if (!acc[user.department]) {
        acc[user.department] = {};
      }
      if (!acc[user.department][user.position]) {
        acc[user.department][user.position] = 0;
      }
      acc[user.department][user.position]++;
      return acc;
    }, {} as { [key: string]: { [key: string]: number } });

    const departments = Object.keys(departmentData);
    const positions = [...new Set(users.map(user => user.position))];
    const datasets = positions.map((position, index) => ({
      label: position,
      data: departments.map(dept => departmentData[dept][position] || 0),
      backgroundColor: this.getColorForIndex(index),
      borderWidth: 1
    }));

    const ctx = document.getElementById('userDepartmentChart') as HTMLCanvasElement;
    if (ctx) {
      this.userDepartmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: departments,
          datasets: datasets
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              stacked: true,
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            x: {
              stacked: true,
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: { color: 'white' }
            },
            title: {
              display: true,
              text: 'Employees by Department and Position',
              color: 'white'
            }
          }
        }
      });
    }
  }

  private getColorForIndex(index: number): string {
    const colors = [
      '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', 
      '#9b59b6', '#e67e22', '#1abc9c', '#34495e'
    ];
    return colors[index % colors.length];
  }



  private initializeTaskCharts() {
    // Ensure DOM is ready
    setTimeout(() => {
      this.initializeTaskStatusChart();
      this.initializeTasksByDepartmentChart();
    });
  }


  private initializeTaskStatusChart() {
    const statusCounts: { [key in Task['status']]: number } = {
      'Pending': 0,
      'In Progress': 0,
      'Completed': 0
    };
  
    this.tasks.forEach(task => {
      if (task.status in statusCounts) {
        statusCounts[task.status]++;
      }
    });
  
    const ctx = document.getElementById('taskStatusChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.taskStatusChart) {
        this.taskStatusChart.destroy();
      }
      
      this.taskStatusChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: [
              '#e74c3c',  // Pending - Red
              '#f1c40f',  // In Progress - Yellow
              '#2ecc71'   // Completed - Green
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: 'white' }
            },
            title: {
              display: true,
              text: 'Task Status Distribution',
              color: 'white'
            }
          }
        }
      });
    }
  }
  
  private initializeTasksByDepartmentChart() {
    const departmentCounts: { [key: string]: number } = {};
    
    this.tasks.forEach(task => {
      const dept = task.department || 'Unassigned';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
    });
  
    const ctx = document.getElementById('tasksByDepartmentChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.tasksByDepartmentChart) {
        this.tasksByDepartmentChart.destroy();
      }
      
      this.tasksByDepartmentChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(departmentCounts),
          datasets: [{
            label: 'Number of Tasks',
            data: Object.values(departmentCounts),
            backgroundColor: '#3498db',
            borderColor: '#2980b9',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            x: {
              ticks: { color: 'white' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' }
            }
          },
          plugins: {
            legend: {
              labels: { color: 'white' }
            }
          }
        }
      });
    }
  }


  loadApplicants() {
    this.dataService.getApplicants().subscribe({
      next: (data) => {
        this.applicants = data;
        this.initializeApplicantCharts();
      },
      error: (error) => {
        console.error('Error fetching applicants:', error);
      }
    });
  }

  initializeApplicantCharts() {
    this.initializeStatusChart();
    this.initializeDemographicsChart();
    this.initializeDepartmentChart();
    this.initializeCivilStatusChart();
  }

  initializeStatusChart() {
    const statusCounts: StatusCounts = {
      'Pending': 0,
      'Under Review': 0,
      'Approved': 0,
      'Rejected': 0
    };

    this.applicants.forEach(applicant => {
      const status = applicant.status as keyof StatusCounts;
      if (status in statusCounts) {
        statusCounts[status]++;
      }
    });

    const ctx = document.getElementById('applicantStatusChart') as HTMLCanvasElement;
    this.applicantStatusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: [
            '#FFA500', // Pending - Orange
            '#3498db', // Under Review - Blue
            '#2ecc71', // Approved - Green
            '#e74c3c'  // Rejected - Red
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'white',
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: 'Application Status Distribution',
            color: 'white',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }
  
initializeDemographicsChart() {
    const genderCounts: GenderCounts = {
      'Male': 0,
      'Female': 0,
      'Other': 0
    };

    this.applicants.forEach(applicant => {
      const gender = applicant.gender as keyof GenderCounts;
      if (gender in genderCounts) {
        genderCounts[gender]++;
      }
    });

  
    const ctx = document.getElementById('applicantDemographicsChart') as HTMLCanvasElement;
    this.applicantDemographicsChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(genderCounts),
        datasets: [{
          data: Object.values(genderCounts),
          backgroundColor: [
            '#3498db', // Male - Blue
            '#e84393', // Female - Pink
            '#95a5a6'  // Other - Gray
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'white',
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: 'Gender Distribution',
            color: 'white',
            font: {
              size: 16
            }
          }
        }
      }
    });
  }
  
  initializeDepartmentChart() {
    const departmentCounts: ApplicantCounts = {};
    
    this.applicants.forEach(applicant => {
      const department = applicant.department as string;
      if (!departmentCounts[department]) {
        departmentCounts[department] = 0;
      }
      departmentCounts[department]++;
    });
  
    const ctx = document.getElementById('departmentChart') as HTMLCanvasElement;
    this.departmentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(departmentCounts),
        datasets: [{
          label: 'Number of Applicants',
          data: Object.values(departmentCounts),
          backgroundColor: '#3498db',
          borderColor: '#2980b9',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: 'white'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: 'white'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: 'white'
            }
          }
        }
      }
    });
  }
  
  initializeCivilStatusChart() {
    const civilStatusCounts: CivilStatusCounts = {
      'Single': 0,
      'Married': 0,
      'Divorced': 0,
      'Widowed': 0
    };

    this.applicants.forEach(applicant => {
      const civilStatus = applicant.civil_status as keyof CivilStatusCounts;
      if (civilStatus in civilStatusCounts) {
        civilStatusCounts[civilStatus]++;
      }
    });
    const ctx = document.getElementById('civilStatusChart') as HTMLCanvasElement;
    this.civilStatusChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(civilStatusCounts),
        datasets: [{
          data: Object.values(civilStatusCounts),
          backgroundColor: [
            '#1abc9c', // Single - Turquoise
            '#9b59b6', // Married - Purple
            '#e67e22', // Divorced - Orange
            '#34495e'  // Widowed - Dark Blue
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'white',
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            text: 'Civil Status Distribution',
            color: 'white',
            font: {
              size: 16
            }
          }
        }
      }
    });
    
  }

  


  loadUsers() {
    this.dataService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.userMap = this.users.reduce((map, user) => {
          map[user.user_id] = user.fullname;
          return map;
        }, {} as { [key: number]: string });
        // Load tasks after users are loaded
        this.loadTasks();
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
        // Initialize charts after tasks are loaded
        this.initializeTaskCharts();
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
