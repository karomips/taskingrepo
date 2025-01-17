import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface EmailData {
  to: string;
  subject: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost/4ward/taskingrepo/taskingapplication/api/taskingapi';

  constructor(private http: HttpClient) { }

  sendAcceptanceEmail(applicant: {
    email: string;
    first_name: string;
    last_name: string;
  }, customMessage?: string): Observable<any> {
    const emailData: EmailData = {
      to: applicant.email,
      subject: 'Application Accepted - Next Steps',
      body: `Dear ${applicant.first_name} ${applicant.last_name},

We are pleased to inform you that your application has been accepted.${customMessage ? '\n\n' + customMessage : ''}

Your account has been created with the following credentials:

Email: ${applicant.email}
Temporary Password: 123456

Please log in to your account and change your password as soon as possible for security purposes.

Best regards,
Administrator`
    };

    return this.http.post(`${this.apiUrl}/send-email.php`, emailData);
  }

  sendRejectionEmail(applicant: {
    email: string;
    first_name: string;
    last_name: string;
  }, customMessage?: string): Observable<any> {
    const emailData: EmailData = {
      to: applicant.email,
      subject: 'Application Status Update',
      body: `Dear ${applicant.first_name} ${applicant.last_name},

Thank you for your interest in joining our organization. After careful consideration of your application, we regret to inform you that we will not be moving forward with your application at this time.${customMessage ? '\n\n' + customMessage : ''}

We appreciate the time you took to apply and wish you the best in your future endeavors.

Best regards,
Administrator`
    };

    return this.http.post(`${this.apiUrl}/send-email.php`, emailData);
  }
}