import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  toggleMenu() {
    const navbarLinks = document.querySelector('.navbar-links');
    navbarLinks?.classList.toggle('active');
  }
}
