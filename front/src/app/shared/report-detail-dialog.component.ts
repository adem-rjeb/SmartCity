import { Component, Inject, OnInit, ElementRef, ViewChild, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Report } from '../core/models';
import { StatusBadgeComponent } from './status-badge.component';
import { PriorityBadgeComponent } from './priority-badge.component';
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
  selector: 'app-report-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    StatusBadgeComponent,
    PriorityBadgeComponent,
  ],
  template: `
    <div class="dialog-header">
      <div class="header-titles">
        <span class="report-id">REPORT #{{ data.report.id }}</span>
        <h2 mat-dialog-title>{{ data.report.titre }}</h2>
      </div>
      <button mat-icon-button mat-dialog-close class="close-btn">
        <span class="material-icons">close</span>
      </button>
    </div>

    <mat-dialog-content class="dialog-body">
      <!-- Status & Priority Bar -->
      <div class="meta-bar">
        <div class="meta-left">
          <app-status-badge [status]="data.report.status"></app-status-badge>
          <app-priority-badge [priority]="data.report.priority"></app-priority-badge>
          <span class="category-chip" *ngIf="data.report.category">
            <span class="material-icons">category</span>
            {{ data.report.category.nom }}
          </span>
        </div>
        <span class="date-tag">
          <span class="material-icons">schedule</span>
          Submitted {{ data.report.createdAt | date: 'mediumDate' }}
        </span>
      </div>

      <!-- Timeline Progress Tracker -->
      <div class="timeline-tracker">
        <div class="t-step" [class.t-step--done]="isStepDone('PENDING')" [class.t-step--current]="data.report.status === 'PENDING'">
          <div class="t-icon"><span class="material-icons">send</span></div>
          <span class="t-label">Reported</span>
        </div>
        <div class="t-line" [class.t-line--active]="isStepDone('ASSIGNED')"></div>

        <div class="t-step" [class.t-step--done]="isStepDone('ASSIGNED')" [class.t-step--current]="data.report.status === 'ASSIGNED'">
          <div class="t-icon"><span class="material-icons">person_add</span></div>
          <span class="t-label">Assigned</span>
        </div>
        <div class="t-line" [class.t-line--active]="isStepDone('IN_PROGRESS')"></div>

        <div class="t-step" [class.t-step--done]="isStepDone('IN_PROGRESS')" [class.t-step--current]="data.report.status === 'IN_PROGRESS'">
          <div class="t-icon"><span class="material-icons">engineering</span></div>
          <span class="t-label">In Progress</span>
        </div>
        <div class="t-line" [class.t-line--active]="isStepDone('RESOLVED')"></div>

        <div class="t-step" [class.t-step--done]="isStepDone('RESOLVED')" [class.t-step--current]="data.report.status === 'RESOLVED'">
          <div class="t-icon"><span class="material-icons">verified</span></div>
          <span class="t-label">Resolved</span>
        </div>
      </div>

      <!-- Description Card -->
      <div class="section-box">
        <h4 class="section-heading">
          <span class="material-icons">notes</span>
          Description
        </h4>
        <p class="description-text">{{ data.report.description || 'No additional details provided.' }}</p>
      </div>

      <!-- Attached Photo Preview if present -->
      <div class="section-box" *ngIf="data.report.photoPath">
        <h4 class="section-heading">
          <span class="material-icons">photo_camera</span>
          Attached Photo
        </h4>
        <div class="photo-container">
          <img [src]="getPhotoUrl(data.report.photoPath)" alt="Report photo" class="report-img" />
        </div>
      </div>

      <!-- Location Section with Map -->
      <div class="section-box">
        <div class="section-header">
          <h4 class="section-heading">
            <span class="material-icons">place</span>
            Location: {{ data.report.adresse || 'Location' }}
          </h4>
          <a
            *ngIf="getDirectionsUrl()"
            [href]="getDirectionsUrl()"
            target="_blank"
            rel="noopener noreferrer"
            class="directions-link"
          >
            <span class="material-icons">directions</span>
            Open in Google Maps
          </a>
        </div>

        <div *ngIf="data.report.latitude && data.report.longitude" class="map-wrapper">
          <div #mapContainer class="dialog-map"></div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-flat-button color="primary" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 1.25rem 1.5rem 0.5rem 1.5rem;
      }
      .report-id {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        color: var(--accent);
        font-weight: 600;
      }
      h2 {
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0.15rem 0 0 0;
      }
      .close-btn {
        color: var(--text-muted);
      }
      .dialog-body {
        padding: 0.5rem 1.5rem 1rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
        max-height: 75vh;
      }
      .meta-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        background: var(--bg-subtle);
        padding: 0.75rem 1rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-base);
        flex-wrap: wrap;
      }
      .meta-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      .category-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.2rem 0.6rem;
        border-radius: var(--radius-full);
        background: var(--bg-elevated);
        border: 1px solid var(--border-base);
        color: var(--text-secondary);
        font-size: 0.75rem;
      }
      .category-chip .material-icons {
        font-size: 0.9rem;
        color: var(--accent);
      }
      .date-tag {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.78rem;
        color: var(--text-muted);
      }
      .date-tag .material-icons {
        font-size: 0.95rem;
      }

      /* Timeline Tracker */
      .timeline-tracker {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--bg-subtle);
        padding: 1rem 1.25rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-base);
      }
      .t-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.3rem;
        position: relative;
        z-index: 2;
      }
      .t-icon {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--bg-elevated);
        border: 2px solid var(--border-base);
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .t-icon .material-icons {
        font-size: 1rem;
      }
      .t-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-muted);
      }
      .t-step--done .t-icon {
        background: var(--success);
        border-color: var(--success);
        color: #fff;
      }
      .t-step--done .t-label {
        color: var(--text-primary);
      }
      .t-step--current .t-icon {
        background: var(--accent-dim);
        border-color: var(--accent);
        color: var(--accent);
      }
      .t-step--current .t-label {
        color: var(--accent);
        font-weight: 600;
      }
      .t-line {
        flex: 1;
        height: 2px;
        background: var(--border-base);
        margin: 0 0.4rem;
        transform: translateY(-8px);
      }
      .t-line--active {
        background: var(--success);
      }

      .section-box {
        background: var(--bg-subtle);
        border: 1px solid var(--border-base);
        border-radius: var(--radius-sm);
        padding: 1rem;
      }
      .section-heading {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 0.5rem 0;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
      .section-heading .material-icons {
        font-size: 1.1rem;
        color: var(--accent);
      }
      .description-text {
        font-size: 0.875rem;
        color: var(--text-secondary);
        line-height: 1.6;
        margin: 0;
      }
      .photo-container {
        border-radius: var(--radius-sm);
        overflow: hidden;
        max-height: 240px;
      }
      .report-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }
      .directions-link {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.78rem;
        color: var(--accent);
        text-decoration: none;
        font-weight: 500;
      }
      .map-wrapper {
        border-radius: var(--radius-sm);
        overflow: hidden;
        border: 1px solid var(--border-base);
      }
      .dialog-map {
        height: 180px;
        width: 100%;
      }
      .dialog-actions {
        padding: 0.75rem 1.5rem;
        border-top: 1px solid var(--border-base);
      }
    `,
  ],
})
export class ReportDetailDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;
  private map?: L.Map;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { report: Report },
    private dialogRef: MatDialogRef<ReportDetailDialogComponent>,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.data.report.latitude && this.data.report.longitude) {
      setTimeout(() => this.initMap(), 150);
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    if (!this.mapContainer || this.map || !this.data.report.latitude || !this.data.report.longitude) {
      return;
    }

    const lat = this.data.report.latitude;
    const lng = this.data.report.longitude;

    this.ngZone.runOutsideAngular(() => {
      this.map = L.map(this.mapContainer!.nativeElement).setView([lat, lng], 15);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(this.map);

      const marker = L.marker([lat, lng]).addTo(this.map);
      marker.bindPopup(`<b>${this.data.report.titre}</b><br>${this.data.report.adresse || ''}`).openPopup();
    });
  }

  isStepDone(step: string): boolean {
    const status = this.data.report.status;
    const order = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
    const currentIdx = order.indexOf(status);
    const stepIdx = order.indexOf(step);
    return stepIdx <= currentIdx;
  }

  getDirectionsUrl(): string | null {
    if (!this.data.report.latitude || !this.data.report.longitude) return null;
    return `https://www.google.com/maps/dir/?api=1&destination=${this.data.report.latitude},${this.data.report.longitude}`;
  }

  getPhotoUrl(photoPath: string): string {
    if (photoPath.startsWith('http')) return photoPath;
    return `/uploads/photos/${photoPath}`;
  }
}
