import { Component } from '@angular/core';
import { SidenavComponent } from '../sidenav/sidenav.component';

@Component({
  selector: 'app-tasklist',
  imports: [SidenavComponent],
  templateUrl: './tasklist.component.html',
  styleUrl: './tasklist.component.css'
})
export class TasklistComponent {
  onSidenavHoverChanged($event: boolean) {
    throw new Error('Method not implemented.');
    }
}
