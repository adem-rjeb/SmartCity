import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AssignmentService } from '../core/assignment.service';
import { Assignment, AssignmentStatus } from '../core/models';
import * as L from 'leaflet';

const DefaultIcon = L.icon({
  iconUrl: '/assets/leaflet/marker-icon.png',
  iconRetinaUrl: '/assets/leaflet/marker-icon-2x.png',
  shadowUrl: '/assets/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

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
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css'],
})
export class TaskDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly assignmentService = inject(AssignmentService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly ngZone = inject(NgZone);

  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;
  private map?: L.Map;

  protected assignment: Assignment | null = null;
  protected isSubmitting = false;
  protected selectedProofFileName = '';
  protected proofPhotoPreviewUrl: string | null = null;
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

    this.loadTask(id);
  }

  ngAfterViewInit(): void {
    if (this.assignment) {
      this.initMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private loadTask(id: number): void {
    this.assignmentService.getAssignment(id).subscribe({
      next: (assignment) => {
        this.assignment = assignment;
        this.form.patchValue({
          status: assignment.status as AssignmentStatus,
          commentaire: assignment.commentaire ?? '',
        });
        setTimeout(() => this.initMap(), 100);
      },
      error: (err) => {
        console.error('Error loading assignment:', err);
        this.snackBar.open('Failed to load task details.', 'Close', { duration: 4000 });
        this.goBack();
      },
    });
  }

  private initMap(): void {
    if (!this.mapContainer || this.map || !this.assignment?.report) {
      return;
    }

    const lat = this.assignment.report.latitude;
    const lng = this.assignment.report.longitude;

    if (!lat || !lng) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.map = L.map(this.mapContainer!.nativeElement).setView([lat, lng], 15);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(this.map);

      const marker = L.marker([lat, lng]).addTo(this.map);
      marker.bindPopup(`<b>${this.assignment?.report?.titre}</b><br>${this.assignment?.report?.adresse || ''}`).openPopup();
    });
  }

  getDirectionsUrl(): string | null {
    if (!this.assignment?.report?.latitude || !this.assignment?.report?.longitude) {
      return null;
    }
    const lat = this.assignment.report.latitude;
    const lng = this.assignment.report.longitude;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  onProofPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedProofPhoto = input.files[0];
      this.selectedProofFileName = this.selectedProofPhoto.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.proofPhotoPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedProofPhoto);
    }
  }

  changeStatus(newStatus: AssignmentStatus): void {
    if (!this.assignment?.id) return;
    this.form.patchValue({ status: newStatus });
    this.updateStatus();
  }

  updateStatus(): void {
    if (this.form.invalid || !this.assignment?.id) {
      return;
    }

    this.isSubmitting = true;
    const targetStatus = this.form.value.status as AssignmentStatus;
    const note = this.form.value.commentaire || undefined;

    this.assignmentService.updateAssignmentStatus(this.assignment.id, targetStatus, note).subscribe({
      next: (updated) => {
        this.assignment = updated;
        this.snackBar.open(`Task status updated to ${targetStatus}!`, 'OK', { duration: 3000 });
        this.isSubmitting = false;
        if (targetStatus === 'COMPLETED' || targetStatus === 'CANCELLED') {
          setTimeout(() => this.goBack(), 1200);
        }
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.snackBar.open('Failed to update status.', 'Close', { duration: 4000 });
        this.isSubmitting = false;
      },
    });
  }

  getStepState(stepName: string): 'completed' | 'active' | 'pending' {
    if (!this.assignment) return 'pending';
    const status = this.assignment.status;

    const order = ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepName);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  }

  getPriorityClass(priority?: string): string {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return 'priority-tag priority-urgent';
      case 'HIGH':
        return 'priority-tag priority-high';
      case 'MEDIUM':
        return 'priority-tag priority-medium';
      default:
        return 'priority-tag priority-low';
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/agent');
  }
}
