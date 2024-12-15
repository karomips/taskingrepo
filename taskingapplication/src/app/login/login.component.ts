import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Define the properties to bind to the form input
  email: string = '';
  password: string = '';
  responseMessage: string = ''; // To display messages to the user

  constructor(private router: Router) {}

  async onSubmit(event: Event) {
    event.preventDefault(); // Prevent default form submission

    try {
      const response = await fetch('login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: this.email, password: this.password }), // Send form data
      });

      if (response.ok) {
        const data = await response.json();

        if (data[0]) {
          // Assuming data[0] contains user info
          localStorage.setItem('authToken', 'your-token-here'); // Store token in localStorage

          this.router.navigate(['/home']); // Redirect to Home page after successful login
        } else {
          this.responseMessage = 'Invalid credentials. Please try again.';
        }
      } else if (response.status === 404) {
        this.responseMessage = 'Invalid credentials. Please try again.';
      } else {
        this.responseMessage = 'An error occurred. Please try again later.';
      }
    } catch (error) {
      this.responseMessage = 'An error occurred while connecting to the server.';
    }
  }
}
