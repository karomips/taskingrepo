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
  selector: 'app-home',
  standalone: true,
  imports: [SidenavComponent, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tasks: Task[] = [];
  searchQuery: string = '';
  selectedFilter: string = 'all';
  isSidenavHovered = false;

  constructor(
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.loadTasks();
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
  onSidenavHoverChanged(isHovered: boolean) {
    this.isSidenavHovered = isHovered;
  }
}