import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router to navigate

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  showSignoutModal: boolean = false; // Controls the visibility of the modal

  constructor(private router: Router) {} // Inject Router service to navigate programmatically

  // Opens the sign-out modal
  openSignoutModal() {
    this.showSignoutModal = true; // Show the modal when the button is clicked
  }

  // Closes the sign-out modal
  closeSignoutModal() {
    this.showSignoutModal = false; // Hide the modal when "Cancel" is clicked
  }

  // Confirms the sign-out and navigates to the login page
  confirmSignout() {
    this.showSignoutModal = false; // Close the modal
    this.router.navigate(['/login']); // Navigate to the login page
  }

  // Toggles the menu for mobile view
  toggleMenu() {
    const navbarLinks = document.querySelector('.navbar-links');
    navbarLinks?.classList.toggle('active');
  }
}
