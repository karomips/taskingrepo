import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {
  @Output() hoverStateChanged = new EventEmitter<boolean>();
  showSignoutModal: boolean = false;
  isMinimized = false;

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isMinimized = !this.isMinimized;
  }

  openSignoutModal() {
    this.showSignoutModal = true;
  }

  closeSignoutModal() {
    this.showSignoutModal = false;
  }

  confirmSignout() {
    this.showSignoutModal = false;
    this.router.navigate(['/login']);
  }

  onHover(isHovered: boolean) {
    this.hoverStateChanged.emit(isHovered);
  }
}
