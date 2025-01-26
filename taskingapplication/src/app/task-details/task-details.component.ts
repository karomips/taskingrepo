  import { CommonModule } from '@angular/common';
  import { Component } from '@angular/core';
  import { ActivatedRoute, Router } from '@angular/router';
  import { SidenavComponent } from '../sidenav/sidenav.component';
  import { DataService } from '../data.service';


  interface User {
    user_id: number;
    name: string;
  }

  interface Task {
    id: number;
    task_name: string;
    assigned_users?: User[]; // Added assigned users field
    progress?: number;       // Added progress field
    status: string;
    created_at: string;
    task_files?: any[]; // Added task_files field
  }

  @Component({
    selector: 'app-task-details',
    imports: [CommonModule, SidenavComponent],
    templateUrl: './task-details.component.html',
    styleUrl: './task-details.component.css'
  })
  export class TaskDetailsComponent {

    selectedTask: Task | null = null;
    tasks: Task[] = [];
    isSidenavHovered = false;

    constructor(private route: ActivatedRoute, private router: Router, private dataService: DataService) {}

// In ngOnInit, assuming task 41 is displayed but files need to be for task 40
ngOnInit(): void {
  const taskId = this.route.snapshot.paramMap.get('id');
  if (taskId) {
    this.loadTasks();
    // this.fetchTaskFiles(40);  // Manually pass the correct task_id here (task 40)
  }
}
    
    loadTasks(): void {
      const taskId = this.route.snapshot.paramMap.get('id');  // Fetch task ID from route
      this.dataService.getTasks().subscribe({
        next: (tasks: Task[]) => {
          this.tasks = tasks;
          if (taskId) {
            this.selectedTask = this.tasks.find(task => task.id.toString() === taskId) || null;
            if (this.selectedTask) {
              this.fetchTaskFiles(this.selectedTask.id);  // Pass correct task_id
            }
          }
        },
        error: (error) => {
          console.error('Error fetching tasks:', error);
          this.router.navigate(['/tasks']);
        }
      });
    }
    

fetchTaskFiles(taskId: number): void {
  console.log(`Fetching task files for task_id: ${taskId}`);  // Log to verify task_id
  this.dataService.fetchUserTaskFiles(taskId).subscribe({
    next: (taskFiles) => {
      console.log('Received task files:', taskFiles);  // Log received task files
      if (this.selectedTask) {
        this.selectedTask.task_files = taskFiles;
      }
    },
    error: (error) => {
      console.error('Error fetching task files:', error);
    }
  });
}

getAssignedUserForFile(file: any): User | undefined {
  if (this.selectedTask?.assigned_users) {
    return this.selectedTask.assigned_users.find(user => user.user_id === file.task_id);
  }
  return undefined;
}


    onSidenavHoverChanged(isHovered: boolean): void {
      this.isSidenavHovered = isHovered;
    }

    goBack() {
      this.router.navigate(['/tasking']); // Navigate back to the Tasking component
    }

    formatDate(date: string): string {
      return new Date(date).toLocaleDateString(); // Format date
    }

    getStatusClass(status: string): string {
      return {
        pending: 'status-pending',
        'in-progress': 'status-in-progress',
        completed: 'status-completed',
      }[status] || 'status-default';
    }
  }