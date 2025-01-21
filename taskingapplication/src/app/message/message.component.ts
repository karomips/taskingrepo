import { Component, OnInit } from '@angular/core';
import { DataService, User, Message } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, SidenavComponent]
})
export class MessageComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  messageContent: string = '';
  searchTerm: string = '';
  messages: Message[] = [];
  loading: boolean = false;
  currentAdminId: number; // Add this property
  private messageUpdateInterval: any;
  error: string = '';
  selectedDepartment: string = '';
  departments: string[] = [
    'Human Resources',
    'Information Technology',
    'Marketing',
    'Finance',
    'Operations',
    'Sales'
  ];
  defaultProfileImage: string = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSIzNSIgcj0iMjUiIGZpbGw9IiNlMWUxZTEiLz4KICA8Y2lyY2xlIGN4PSI1MCIgY3k9IjEwMCIgcj0iNDUiIGZpbGw9IiNlMWUxZTEiLz4KPC9zdmc+';
    @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent new line
      this.sendMessage();
    }
  }


 
  constructor(private dataService: DataService) {
    // Get admin ID from localStorage
    const storedAdminId = localStorage.getItem('adminId');
    this.currentAdminId = storedAdminId ? parseInt(storedAdminId, 10) : 1;
}

  ngOnInit() {
    this.loadActiveUsers();
  }

  ngOnDestroy() {
    if (this.messageUpdateInterval) {
      clearInterval(this.messageUpdateInterval);
    }
  }

  onSidenavHoverChanged($event: boolean) {
    throw new Error('Method not implemented.');
    }

    loadActiveUsers() {
      this.dataService.getUsers().subscribe({
        next: (users) => {
          this.users = users.filter(user => user.status === 'Active');
          this.filterUsers();
        },
        error: (error) => console.error('Error loading users:', error)
      });
    }
  
  
    filterUsers() {
      let filtered = this.users;
  
      // Apply search term filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        filtered = filtered.filter(user => 
          user.fullname.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }
  
      // Apply department filter
      if (this.selectedDepartment) {
        filtered = filtered.filter(user => 
          user.department === this.selectedDepartment
        );
      }
  
      this.filteredUsers = filtered;
    }
  
  selectUser(user: User) {
    this.selectedUser = user;
    this.messageContent = '';
    this.loadMessages();
    
    // Setup periodic message updates
    if (this.messageUpdateInterval) {
      clearInterval(this.messageUpdateInterval);
    }
    this.messageUpdateInterval = setInterval(() => {
      this.loadMessages(false);
    }, 10000); // Update every 10 seconds
  }

 
  sendMessage() {
    if (!this.selectedUser || !this.messageContent.trim()) {
      return;
    }
    
    this.dataService.sendMessage(this.currentAdminId, this.selectedUser.user_id, this.messageContent)
      .subscribe({
        next: (response) => {
          if (response && response.success) {
            this.messageContent = '';
            this.loadMessages(false);
          }
        },
        error: (error) => {
          console.error('Error sending message:', error);
          alert('Failed to send message. Please try again.');
        }
      });
  }
  loadMessages(showLoading: boolean = true) {
    if (!this.selectedUser) {
        console.warn('No user selected');
        return;
    }

    if (showLoading) {
        this.loading = true;
    }

    this.error = ''; // Clear any previous errors

    console.log('Loading messages:', {
        adminId: this.currentAdminId,
        userId: this.selectedUser.user_id
    });

    this.dataService.getMessages(this.currentAdminId, this.selectedUser.user_id)
        .subscribe({
            next: (messages) => {
                console.log('Messages loaded:', messages);
                this.messages = messages;
                this.loading = false;
                setTimeout(() => this.scrollToBottom(), 100);
            },
            error: (error) => {
                console.error('Error loading messages:', error);
                this.error = 'Failed to load messages. Please try again.';
                this.loading = false;
                this.messages = [];
            },
            complete: () => {
                this.loading = false;
            }
        });
}

  scrollToBottom(): void {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch(err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
  getProfileImage(user: User): string {
    return user.profile_picture || this.defaultProfileImage;
}
}