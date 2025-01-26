import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { of } from 'rxjs';

export interface User {
  id: any;
  user_id: number;
  fullname: string;
  email: string;
  contact_number: string;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  civil_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  gender: 'Male' | 'Female' | 'Other';
  department: string;
  position: string;
  profile_picture: string;
  created_at: string;
  status: 'Active' | 'Inactive';
}
export interface Task {
  id: number;
  task_name: string;
  task_description: string;
  task_instructions: string;
  due_date: string;
  status: string;
  assigned_to: number;
  assigned_to_name: string;    // Added field
  department: string;          // Added field
  created_by: number;
  created_by_name: string;     // Added field
  created_at: string;
  updated_at: string;
  progress?: number;
  file_attachment?: string;
  admin_comments?: string;
  current_time?: string;
  current_user?: string;
}

interface TaskFile {
  id: number;
  task_id: number;
  filename: string;
  filepath: string;
  upload_date: string;
}


interface User_documents {
  id: number;
  user_id: number;
  filename: string;
  filepath: string;
  upload_date: string;
  docstype: string;
}

export interface Applicant {
  applicant_id: number;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  suffix: string | null;
  contact_number: string;
  email: string;
  date_of_birth: string;
  place_of_birth: string;
  nationality: string;
  civil_status: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  gender: 'Male' | 'Female' | 'Other';
  department: string;  // Added this
  position: string;    // Added this
  created_at: string;
  status: 'Pending' | 'Under Review' | 'Approved' | 'Rejected';
}

export interface ApplicantDocument {
  document_id: number;
  applicant_id: number;
  document_type: 'Resume' | 'Government ID' | 'Birth Certificate' | 'Diploma' | 'Training Certificates' | 'Other';
  filename: string;
  filepath: string;
  upload_date: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  mime_type?: string;
}

export interface Message {
  message_id: number;
  admin_id: number;
  user_id: number;
  message_content: string;
  sent_at: string;
  is_read: boolean;
  admin_username?: string;
  user_fullname?: string;
}
export interface TaskAssignment {
  taskName: string;
  taskDescription: string;
  taskInstructions: string;
  dueDate: string;
  assignedTo: number;  // This should be a number
  createdBy: number;
  department: string;
  created_at?: string; // Optional since it's added during submission
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  updateTaskProgress(id: number, progress: string | undefined) {
    throw new Error('Method not implemented.');
  }
  

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

  public assignTask(task: TaskAssignment): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}/assigntask.php`, task)
      .pipe(
        map(response => {
          if (response.success) {
            return response;
          } else {
            throw new Error(response.message);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Method to assign a task
  // public assignTask(task: { department: string, taskName: string, taskDescription: string, taskInstructions: string, dueDate: string, assignedTo: number, createdBy: number }): Observable<any> {
  //   return this.httpClient.post<any>(`${this.baseUrl}/assigntask.php`, task)
  //     .pipe(
  //       map(response => {
  //         if (response.success) {
  //           return response;  // Return the response on success
  //         } else {
  //           throw new Error(response.message);  // Throw error if assignment fails
  //         }
  //       }),
  //       catchError(this.handleError)  // Catch any errors
  //     );
  // }

  getEmployees(): Observable<any[]> {
    return this.httpClient.get<any[]>('/api/users');  // Endpoint to get users' data
  }

// Change the profile_picture path logic
getUsers(): Observable<User[]> {
  return this.httpClient.get<User[]>(`${this.baseUrl}/getUsers.php`).pipe(
    map((users: User[]) => {
      const profileImageBaseUrl = "http://localhost/4ward/eoportal/eoportalapi/";
      return users.map(user => ({
        ...user,
        profile_picture: user.profile_picture ? profileImageBaseUrl + user.profile_picture : ''
      }));
    }),
    catchError(this.handleError)
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
          if (!response) return [];
          return response;
        }),
        catchError(error => {
          console.error('API Error:', error);
          return throwError(() => error);
        })
      );
  }

  // getTaskById(taskId: string): Observable<Task> {
  //   return this.httpClient.get<Task>(`${this.baseUrl}/getTasks.php?id=${taskId}`).pipe(
  //     catchError(this.handleError)
  //   );
  // }
  


  fetchUserTaskFiles(taskId: number): Observable<any[]> {
    console.log(`Fetching task files for task_id: ${taskId}`); // Log the task ID
    return this.httpClient.get<any[]>(`${this.baseUrl}/getTaskFiles.php?task_id=${taskId}`).pipe(
      catchError(this.handleError),
      map((taskFiles) => {
        if (!taskFiles || taskFiles.length === 0) {
          return [];  // Return empty array if no task files are found
        }
  
        // Base URL for task files
        const taskFilesBaseUrl = "http://localhost/4ward/eoportal/eoportalapi/uploads/task_files/";
  
        // Construct the full file path for each task file
        return taskFiles.map(file => {
          if (file.filepath) {
            // If the filepath is relative, adjust it to the correct path based on userId and file structure
            file.filepath = `${taskFilesBaseUrl}${file.filepath.replace(/^..\//, '')}`;
          } else {
            file.filepath = '';  // Handle missing filepath
          }
          return file;
        });
      })
    );
  }
  
  
  
  
  updateTaskAdminComments(taskId: number, adminId: number, adminComment: string): Observable<any> {
    const commentData = {
      task_id: taskId,
      admin_id: adminId,
      admin_comment: adminComment,
    };
  
    return this.httpClient.put<any>(
      `${this.baseUrl}/update_task_comment.php`,  // Ensure this URL points to your PHP file
      commentData
    );
  }
  
  

  // Get tasks for specific user
  fetchUserTasks(userId: number): Observable<Task[]> {
    return this.httpClient.get<Task[]>(`${this.baseUrl}/getTasks.php?user_id=${userId}`)
      .pipe(
        catchError(this.handleError)
      );
  }
  getTasksByDate(): Observable<any[]> {
    return this.getTasks().pipe(
      map(tasks => {
        // Group tasks by date
        const groupedTasks = tasks.reduce((acc: { [key: string]: number }, task) => {
          const date = new Date(task.created_at).toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        // Convert to array and sort by date
        return Object.entries(groupedTasks)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(-7); // Get last 7 days
      })
    );
  }
  downloadDocument(documentId: number): Observable<Blob> {
    const url = `${this.baseUrl}/download_document.php?document_id=${documentId}`; // Changed from file_id to document_id
    
    return this.httpClient.get(url, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        if (!response.body) {
          throw new Error('No content received');
        }
        return response.body;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Download error:', error);
        
        if (error.error instanceof Blob) {
          return new Observable<never>(observer => {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const errorResponse = JSON.parse(reader.result as string);
                observer.error(new Error(errorResponse.details || 'Download failed'));
              } catch {
                observer.error(new Error('Download failed: Unknown error'));
              }
            };
            reader.readAsText(error.error);
          });
        }
        
        return throwError(() => new Error('Failed to download file'));
      })
    );
  }

  downloadTaskFile(fileId: number): Observable<Blob> {
    const url = `${this.baseUrl}/download_task_file.php?file_id=${fileId}`;
  
    return this.httpClient.get(url, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
          if (!response.body) {
              throw new Error('No content received');
          }
          return response.body;
      }),
      catchError((error: HttpErrorResponse) => {
          console.error('Download error:', error);
  
          if (error.error instanceof Blob) {
              return new Observable<never>(observer => {
                  const reader = new FileReader();
                  reader.onload = () => {
                      try {
                          const errorResponse = JSON.parse(reader.result as string);
                          observer.error(new Error(errorResponse.details || 'Download failed'));
                      } catch {
                          observer.error(new Error('Failed to parse error response'));
                      }
                  };
                  reader.readAsText(error.error);
              });
          }
  
          return throwError(() => new Error('Failed to download file. Please check if the file exists.'));
      })
    );
  }
  getApplicants(): Observable<Applicant[]> {
    return this.httpClient.get<Applicant[]>(`${this.baseUrl}/getApplicants.php`);
  }

  getApplicantDocuments(applicantId: number): Observable<ApplicantDocument[]> {
    return this.httpClient.get<ApplicantDocument[]>(
      `${this.baseUrl}/getApplicantDocuments.php?applicant_id=${applicantId}`
    );
  }

  updateApplicantStatus(applicantId: number, status: 'Approved' | 'Rejected'): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
  
    return this.httpClient.put<any>(
      `${this.baseUrl}/updateApplicantStatus.php`,
      { applicant_id: applicantId, status: status },
      { headers: headers }
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.error || 'Failed to update status');
        }
        return response;
      }),
      catchError(error => {
        console.error('Error updating applicant status:', error);
        return throwError(() => new Error(error.message || 'Failed to update applicant status'));
      })
    );
  }
  viewDocument(documentId: number): Observable<any> {
    const url = `${this.baseUrl}/view_document.php?document_id=${documentId}`;
    
    // For PDF and image files, we'll open them in a new window
    window.open(url, '_blank');
    
    // Return an observable that completes immediately
    return of(null);
  }
  updateUserStatus(userId: number, status: 'Active' | 'Inactive', reason?: string): Observable<any> {
    return this.httpClient.put<any>(`${this.baseUrl}/updateUserStatus.php`, {
      user_id: userId,
      status: status,
      reason: reason  // Send reason as part of the request if provided
    }).pipe(
      catchError(this.handleError)
    );
  }
  

  sendMessage(adminId: number, userId: number, content: string): Observable<any> {
    const messageData = {
      admin_id: adminId,
      user_id: userId,
      message_content: content
    };
  
    return this.httpClient.post<any>(
      `${this.baseUrl}/sendMessage.php`,
      messageData,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        }),
        // Add observe: 'response' to get the full response
        observe: 'response'
      }
    ).pipe(
      map(response => {
        // Check if we have a response body
        if (response.body) {
          return response.body;
        }
        // If no body but status is 200, consider it success
        if (response.status === 200) {
          return { success: true, message: 'Message sent successfully' };
        }
        throw new Error('Invalid response from server');
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Server error:', error);
        if (error.status === 200 && error.statusText === 'OK') {
          // If we got a 200 but parsing failed, still treat as success
          return of({ success: true, message: 'Message sent successfully' });
        }
        return throwError(() => new Error(`Message sending failed: ${error.message}`));
      })
    );
  }
  getMessages(adminId: number, userId: number): Observable<Message[]> {
    console.log(`Fetching messages for admin ${adminId} and user ${userId}`);
    
    return this.httpClient.get<any>(
        `${this.baseUrl}/getMessages.php`,
        {
            params: {
                admin_id: adminId.toString(),
                user_id: userId.toString()
            }
        }
    ).pipe(
        map(response => {
            if (response.success && Array.isArray(response.messages)) {
                return response.messages;
            }
            throw new Error(response.error || 'Invalid response format');
        }),
        catchError(error => {
            console.error('Error in getMessages:', error);
            return throwError(() => new Error('Failed to fetch messages'));
        })
    );
}
}