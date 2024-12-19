import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';

interface User {
  user_id: number;
  fullname: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public redirectUrl: string = '';  // Set a default empty string or any URL you'd like
  private baseUrl: string = "http://localhost/4ward/taskingrepo/taskingapplication/api/taskingapi";

  @Output() getLoggedInName: EventEmitter<boolean> = new EventEmitter();  // EventEmitter with Output decorator

  constructor(private httpClient: HttpClient) { }


  

  // Login method
  public adminlogin(admin_username: string, password: string): Observable<any> {
    return this.httpClient.post<any>(this.baseUrl + '/login.php', { admin_username, password })
      .pipe(
        map(response => {
          if (response && response[0] && response[0].admin_username) {
            this.setToken(response[0].admin_username);  // Store the token or username
            this.getLoggedInName.emit(true);  // Emit the login status
            return response;  // Return the response data
          } else {
            this.getLoggedInName.emit(false);  // Login failed
            throw new Error('Invalid username or password');
          }
        }),
        catchError(this.handleError)  // Catch any errors
      );
  }

  // Method to assign a task
  public assignTask(task: { taskName: string, taskDescription: string, taskInstructions: string, dueDate: string, assignedTo: number, createdBy: number }): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}/assigntask.php`, task)
      .pipe(
        map(response => {
          if (response.success) {
            return response;  // Return the response on success
          } else {
            throw new Error(response.message);  // Throw error if assignment fails
          }
        }),
        catchError(this.handleError)  // Catch any errors
      );
  }

  getUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(`${this.baseUrl}/getUsers.php`);
  }

  // Set token
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Get token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Delete token
  deleteToken(): void {
    localStorage.removeItem('token');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const userToken = this.getToken();
    return userToken !== null;  // Return true if token exists, otherwise false
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));  // Throw the error to be handled by the calling function
  }
}