import { Component } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  angForm: FormGroup;
  isLoading: boolean = false;  // Add the 'isLoading' property

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router
  ) {
    // Initialize the form
    this.angForm = this.fb.group({
      admin_username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  postdata(formValue: FormGroup): void {
    if (formValue.valid) {
      const admin_username = formValue.value.admin_username;
      const password = formValue.value.password;
  
      this.isLoading = true;  // Start loading
      this.dataService.adminlogin(admin_username, password).subscribe(
        (response) => {
          console.log('Login successful:', response);
          this.router.navigate(['/home']);  // Redirect to home
        },
        (error) => {
          console.error('Login failed:', error);
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: error.error?.message || 'Invalid username or password',
          });  // Show Swal alert with the error
        },
        () => {
          this.isLoading = false;  // End loading
        }
      );
    } else {
      alert('Please fill in both fields.');
    }
  }
  
}  