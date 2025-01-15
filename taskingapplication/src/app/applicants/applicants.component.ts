import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { DataService } from '../data.service';

interface Applicant {
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
  civil_status: string;
  gender: string;
  created_at: string;
  status: string;
  documents: ApplicantDocument[];
}

interface ApplicantDocument {
  document_id: number;
  applicant_id: number;
  document_type: string;
  filename: string;
  filepath: string;
  upload_date: string;
  status: string;
}

@Component({
  selector: 'app-applicants',
  standalone: true,
  imports: [CommonModule, SidenavComponent],
  templateUrl: './applicants.component.html',
  styleUrls: ['./applicants.component.css']
})
export class ApplicantsComponent implements OnInit {
  applicants: Applicant[] = [];
  selectedApplicant: Applicant | null = null;
  loading = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadApplicants();
  }

  loadApplicants(): void {
    this.loading = true;
    this.dataService.getApplicants().subscribe({
      next: (applicants) => {
        this.applicants = applicants.map(applicant => ({
          ...applicant,
          documents: [] // Initialize documents array for each applicant
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading applicants:', error);
        this.loading = false;
      }
    });
  }

  loadApplicantDocuments(applicant: Applicant): void {
    // Create a copy of the applicant with empty documents array
    this.selectedApplicant = { ...applicant, documents: [] };
    
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

  onSidenavHover(isHovered: boolean): void {
    console.log('Sidenav hover state changed:', isHovered);
  }
}