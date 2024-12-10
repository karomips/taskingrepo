import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private router: Router) {}

  async onSubmit(event: Event) {
    event.preventDefault(); // Prevent default form submission

    const email = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    try {
      const response = await fetch('login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Assuming 'data' contains an authentication token or user info
        localStorage.setItem('authToken', 'your-token-here'); // Store token in localStorage

        this.router.navigate(['/home']); // Redirect to the Home page after successful login
      } else if (response.status === 404) {
        document.getElementById('responseMessage')!.textContent = 'Invalid credentials. Please try again.';
      } else {
        document.getElementById('responseMessage')!.textContent = 'An error occurred. Please try again later.';
      }
    } catch (error) {
      document.getElementById('responseMessage')!.textContent = 'An error occurred while connecting to the server.';
    }
  }
}
