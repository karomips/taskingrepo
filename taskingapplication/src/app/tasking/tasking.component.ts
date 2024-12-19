import { Component } from '@angular/core';
import { SidenavComponent } from "../sidenav/sidenav.component";
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DataService } from '../data.service';

interface Task {
  id: number;
  task_name: string;
  task_description: string;
  task_instructions: string;
  due_date: string;
  status: string;
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-tasking',
  standalone: true,
  imports: [SidenavComponent, CommonModule, RouterModule], // Add RouterModule here
  templateUrl: './tasking.component.html',
  styleUrls: ['./tasking.component.css']
})
export class TaskingComponent {
  showModal = false;
  taskDescription: string = '';
  isSidenavHovered = false;
  userTasks: any[] = [];

  constructor(private router: Router, private dataService: DataService) {}

  navigateToAssignTask(): void {
    this.router.navigate(['/assigntask']);
  }

  openModal() {
    // Set the description dynamically based on the clicked task
    this.taskDescription = 'This is a detailed description of Task 1';  // Example description
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
  onSidenavHoverChanged(isHovered: boolean) {
    this.isSidenavHovered = isHovered;
  }
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
