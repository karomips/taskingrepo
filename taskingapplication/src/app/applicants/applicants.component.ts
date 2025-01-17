import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { DataService, Applicant, ApplicantDocument } from '../data.service';
import { EmailService } from '../email.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';


interface ApplicantWithDocuments extends Applicant {
  documents: ApplicantDocument[];
}
@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, SidenavComponent, ConfirmationModalComponent],
  templateUrl: './applicants.component.html',
  styleUrls: ['./applicants.component.css']
})
export class ApplicantsComponent implements OnInit {
  applicants: ApplicantWithDocuments[] = [];
  selectedApplicant: ApplicantWithDocuments | null = null;
  loading = false;
  showDetails = false;
  showModal = false;
  modalType: 'accept' | 'reject' = 'accept';
  pendingApplicantId: number | null = null;

  constructor(
    private dataService: DataService,
    private emailService: EmailService
  ) {}


  ngOnInit(): void {
    this.loadApplicants();
  }

  viewDocument(documentId: number): void {
    this.dataService.viewDocument(documentId).subscribe({
      error: (error) => console.error('Error viewing document:', error)
    });
  }

  downloadDocument(documentId: number): void {
    this.dataService.downloadDocument(documentId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // You might want to get the actual filename from the document metadata
        link.download = `document-${documentId}`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error downloading document:', error)
    });
  }

  // Your existing methods...
  loadApplicants(): void {
    this.loading = true;
    this.dataService.getApplicants().subscribe({
      next: (applicants) => {
        this.applicants = applicants.map(applicant => ({
          ...applicant,
          documents: [],
          department: applicant.department || '',
          position: applicant.position || ''
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading applicants:', error);
        this.loading = false;
      }
    });
  }
  
  selectApplicant(applicant: ApplicantWithDocuments): void {
    if (this.selectedApplicant?.applicant_id === applicant.applicant_id) {
      this.selectedApplicant = null;
      this.showDetails = false;
    } else {
      this.selectedApplicant = {
        ...applicant,
        documents: []
      };
      this.showDetails = true;
      this.loadApplicantDocuments(applicant);
    }
  }

  loadApplicantDocuments(applicant: Applicant): void {
    this.selectedApplicant = { ...applicant, documents: [] };  // Initialize with empty documents array
    this.dataService.getApplicantDocuments(applicant.applicant_id).subscribe({
      next: (documents) => {
        if (this.selectedApplicant) {
          this.selectedApplicant = {
            ...this.selectedApplicant,
            documents: documents
          };
        }
      },
      error: (error) => console.error('Error loading documents:', error)
    });
  }

  acceptApplicant(event: Event, applicantId: number): void {
    event.stopPropagation();
    this.showModal = true;
    this.pendingApplicantId = applicantId;
  }

  declineApplicant(event: Event, applicantId: number): void {
    event.stopPropagation();
    this.dataService.updateApplicantStatus(applicantId, 'Rejected').subscribe({
      next: () => {
        const applicant = this.applicants.find(a => a.applicant_id === applicantId);
        if (applicant) {
          this.applicants = this.applicants.map(a => {
            if (a.applicant_id === applicantId) {
              return { ...a, status: 'Rejected' };
            }
            return a;
          });

          this.emailService.sendRejectionEmail(applicant).subscribe({
            next: () => console.log('Rejection email sent successfully'),
            error: (error) => console.error('Error sending rejection email:', error)
          });
        }
      },
      error: (error) => console.error('Error rejecting applicant:', error)
    });
  }

  onSidenavHover(isHovered: boolean): void {
    console.log('Sidenav hover state changed:', isHovered);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(' ', '-');
  }

  onModalConfirm(customMessage: string): void {
    if (!this.pendingApplicantId) return;
    
    this.dataService.updateApplicantStatus(this.pendingApplicantId, 'Approved').subscribe({
      next: () => {
        const applicant = this.applicants.find(a => a.applicant_id === this.pendingApplicantId);
        if (applicant) {
          this.applicants = this.applicants.map(a => {
            if (a.applicant_id === this.pendingApplicantId) {
              return { ...a, status: 'Approved' };
            }
            return a;
          });

          this.emailService.sendAcceptanceEmail(applicant, customMessage).subscribe({
            next: () => console.log('Acceptance email sent successfully'),
            error: (error) => console.error('Error sending acceptance email:', error)
          });
        }
        this.closeModal();
      },
      error: (error) => console.error('Error accepting applicant:', error)
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.pendingApplicantId = null;
  }

}