import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssignmentService } from '../core/assignment.service';
import { Assignment, AssignmentStatus } from '../core/models';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css'],
})
export class TaskDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly assignmentService = inject(AssignmentService);
  private readonly fb = inject(FormBuilder);

  protected assignment: Assignment | null = null;
  protected isSubmitting = false;
  protected selectedProofFileName = '';
  private selectedProofPhoto: File | null = null;

  protected readonly form = this.fb.nonNullable.group({
    status: ['ACCEPTED' as AssignmentStatus, Validators.required],
    commentaire: [''],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.goBack();
      return;
    }

    this.assignmentService.getAssignment(id).subscribe({
      next: (assignment) => {
        this.assignment = assignment;
        // Populate current status in form so agent can see it
        this.form.patchValue({
          status: assignment.status as AssignmentStatus,
        });
      },
      error: (err) => {
        console.error('Error loading assignment:', err);
        alert('Failed to load assignment details.');
        this.goBack();
      },
    });
  }

  onProofPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedProofPhoto = input.files[0];
      this.selectedProofFileName = this.selectedProofPhoto.name;
    }
  }

  updateStatus(): void {
    if (this.form.invalid || !this.assignment?.id) {
      return;
    }

    this.isSubmitting = true;
    this.assignmentService
      .updateAssignmentStatus(
        this.assignment.id,
        this.form.value.status as AssignmentStatus,
        this.form.value.commentaire || undefined,
      )
      .subscribe({
        next: () => {
          alert('Status updated successfully!');
          this.goBack();
        },
        error: (err) => {
          console.error('Error updating status:', err);
          alert('Failed to update status. Please try again.');
          this.isSubmitting = false;
        },
      });
  }

  goBack(): void {
    this.router.navigateByUrl('/agent');
  }
}
