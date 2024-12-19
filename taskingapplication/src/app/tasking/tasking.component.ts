import { Component } from '@angular/core';
import { SidenavComponent } from "../sidenav/sidenav.component";
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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

  constructor(private router: Router) {}

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
}
