import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';

interface User {
  user_id: number;
  fullname: string;
  profile_picture: string;  // Include the profile picture field
  department: string;
}

interface Task {
  id: number;
  task_name: string;
  task_description: string;
  task_instructions: string;
  due_date: string;
  status: string;
  assigned_to: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface User_documents {
  id: number;
  user_id: number;
  filename: string;
  filepath: string;
  upload_date: string;
  docstype: string;
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

  getEmployees(): Observable<any[]> {
    return this.httpClient.get<any[]>('/api/users');  // Endpoint to get users' data
  }

// Change the profile_picture path logic
getUsers(): Observable<User[]> {
  return this.httpClient.get<User[]>(`${this.baseUrl}/getUsers.php`).pipe(
    map((users: User[]) => {
      // Assuming the images are served from a folder outside taskingapplication
      const profileImageBaseUrl = "http://localhost/4ward/eoportal/eoportalapi/"; // Path to the eoportal folder
      return users.map(user => {
        user.profile_picture = profileImageBaseUrl + user.profile_picture;  // Prepend the base URL to the profile picture
        return user;
      });
    })  
  );
}

fetchUserDocuments(userId: number): Observable<any[]> {
  console.log(`Fetching documents for user_id: ${userId}`);
  return this.httpClient.get<any[]>(`${this.baseUrl}/getUser_documents.php?user_id=${userId}`).pipe(
    catchError(this.handleError),
    map((documents) => {
      if (!documents || documents.length === 0) {
        return [];  // Return empty array if no documents are found
      }
      const documentBaseUrl = "http://localhost/4ward/eoportal/eoportalapi/uploads/files/";
      return documents.map(doc => {
        doc.filepath = doc.filepath ? documentBaseUrl + doc.filepath : '';  // Handle missing filepath
        return doc;
      });
    })
  );
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
  getTasks(): Observable<Task[]> {
    return this.httpClient.get<Task[]>(`${this.baseUrl}/getTasks.php`)
      .pipe(
        map(response => {
          // If response is empty or null, return empty array
          if (!response) return [];
          return response;
        }),
        catchError(error => {
          console.error('API Error:', error);
          return throwError(() => error);
        })
      );
  }
  

  // Get tasks for specific user
  fetchUserTasks(userId: number): Observable<Task[]> {
    return this.httpClient.get<Task[]>(`${this.baseUrl}/getTasks.php?user_id=${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }

}