import { Component } from '@angular/core';
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
  showSignoutModal: boolean = false;

  constructor(private router: Router) {}

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
}