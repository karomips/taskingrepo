import { Component } from '@angular/core';
import { SidenavComponent } from "../sidenav/sidenav.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assigntask',
  imports: [SidenavComponent, FormsModule, CommonModule],
  templateUrl: './assigntask.component.html',
  styleUrls: ['./assigntask.component.css']
})
export class AssigntaskComponent {
  task = {
    employeeName: '',
    taskName: '',
    taskDescription: '',
    taskInstructions: '',
    dueDate: ''
  };

  // Flags for success and failure modals
  showSuccessModal = false;
  showFailureModal = false;

  submitTask() {
    // Simulate task assignment (could be saving to a database or calling an API)
    if (this.task.employeeName && this.task.taskName && this.task.taskDescription && this.task.taskInstructions && this.task.dueDate) {
      // Task assignment is successful
      console.log('Task Assigned:', this.task);
      this.showSuccessModal = true;
      this.showFailureModal = false; // Hide failure modal
    } else {
      // Show failure modal if any required field is missing
      this.showFailureModal = true;
      this.showSuccessModal = false; // Hide success modal
    }

    // Reset the form after submission (optional based on requirement)
    this.task = {
      employeeName: '',
      taskName: '',
      taskDescription: '',
      taskInstructions: '',
      dueDate: ''
    };
  }

  closeModal() {
    this.showSuccessModal = false;
    this.showFailureModal = false;
  }
}
