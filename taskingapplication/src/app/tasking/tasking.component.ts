import { Component } from '@angular/core';
import { SidenavComponent } from "../sidenav/sidenav.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasking',
  imports: [SidenavComponent, CommonModule],
  templateUrl: './tasking.component.html',
  styleUrl: './tasking.component.css'
})
export class TaskingComponent {
  showModal = false;
  taskDescription: string = '';

  openModal() {
    // Set the description dynamically based on the clicked task
    this.taskDescription = 'This is a detailed description of Task 1';  // Example description
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}


