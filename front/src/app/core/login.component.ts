import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';
import { AuthService } from './auth.service';
import { ReportService } from './report.service';
import { Report, ReportStatus, UserRole } from './models';

const TUNISIA_CENTER: L.LatLngExpression = [34.0, 9.0];
const DEFAULT_MAP_ZOOM = 7;
const MAP_DETAIL_ZOOM = 14;

interface MappableReport {
  title: string;
  address: string;
  status: ReportStatus;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly reportService = inject(ReportService);
  private readonly zone = inject(NgZone);

  @ViewChild('reportsMap', { static: true })
  private readonly reportsMapRef!: ElementRef<HTMLDivElement>;

  private reportsSubscription?: Subscription;
  private map?: L.Map;
  private reportsLayer?: L.LayerGroup;
  private mappableReports: MappableReport[] = [];

  protected errorMessage = '';
  protected isSubmitting = false;
  protected isMapLoading = true;
  protected mapErrorMessage = '';
  protected reportLocationsCount = 0;

  protected readonly form = this.fb.nonNullable.group({
    email: ['citizen@example.com', [Validators.required, Validators.email]],
    password: ['password', Validators.required],
  });

  ngOnInit(): void {
    this.reportsSubscription = this.reportService.getReports().subscribe({
      next: (reports) => {
        this.mappableReports = this.extractMappableReports(reports);
        this.reportLocationsCount = this.mappableReports.length;
        this.isMapLoading = false;
        this.renderReportMarkers();
      },
      error: (err: HttpErrorResponse) => {
        this.isMapLoading = false;
        this.mapErrorMessage = this.extractMapErrorMessage(err);
      },
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.reportsSubscription?.unsubscribe();
    this.map?.remove();
    this.reportsLayer = undefined;
    this.map = undefined;
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    this.auth.login(this.form.value.email!, this.form.value.password!).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.navigateByRole();
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting = false;
        this.errorMessage = this.extractErrorMessage(err);
      },
    });
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    const body = err.error;
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (err.status === 0) {
      return 'Cannot reach API. Is Symfony running on http://localhost:8000?';
    }
    return err.message || `Login failed (${err.status})`;
  }

  private navigateByRole(): void {
    const role = this.auth.getUserRole();
    const map: Record<UserRole, string> = {
      ROLE_CITIZEN: '/citizen',
      ROLE_AGENT: '/agent',
      ROLE_ADMIN: '/admin',
      ROLE_SUPER_ADMIN: '/supervisor',
    };

    const target = role ? map[role] : map['ROLE_CITIZEN'];
    this.router.navigateByUrl(target);
  }

  private initMap(): void {
    this.zone.runOutsideAngular(() => {
      this.map = L.map(this.reportsMapRef.nativeElement, {
        center: TUNISIA_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(this.map);

      this.reportsLayer = L.layerGroup().addTo(this.map);
      this.renderReportMarkers();
      setTimeout(() => this.map?.invalidateSize(), 0);
    });
  }

  private extractMappableReports(reports: Report[]): MappableReport[] {
    return reports
      .map((report) => {
        const latitude = Number(report.latitude);
        const longitude = Number(report.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }
        return {
          title: report.titre,
          address: report.adresse,
          status: report.status,
          latitude,
          longitude,
        } satisfies MappableReport;
      })
      .filter((report): report is MappableReport => report !== null);
  }

  private renderReportMarkers(): void {
    if (!this.map || !this.reportsLayer) {
      return;
    }

    this.reportsLayer.clearLayers();
    if (this.mappableReports.length === 0) {
      return;
    }

    const bounds = L.latLngBounds([]);
    for (const report of this.mappableReports) {
      const marker = L.circleMarker([report.latitude, report.longitude], {
        radius: 7,
        color: this.getStatusColor(report.status),
        fillColor: this.getStatusColor(report.status),
        fillOpacity: 0.82,
        weight: 2,
      });

      marker.bindPopup(
        `<strong>${this.escapeHtml(report.title)}</strong><br>${this.escapeHtml(report.address)}<br><small>Status: ${this.escapeHtml(report.status)}</small>`,
      );
      marker.addTo(this.reportsLayer);
      bounds.extend([report.latitude, report.longitude]);
    }

    this.map.fitBounds(bounds, { padding: [24, 24], maxZoom: MAP_DETAIL_ZOOM });
  }

  private getStatusColor(status: ReportStatus): string {
    const palette: Record<ReportStatus, string> = {
      PENDING: '#f59e0b',
      UNDER_REVIEW: '#3b82f6',
      ASSIGNED: '#10b981',
      IN_PROGRESS: '#14b8a6',
      RESOLVED: '#22c55e',
      REJECTED: '#ef4444',
      CLOSED: '#64748b',
    };
    return palette[status] ?? '#0ea5e9';
  }

  private extractMapErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Cannot load report map because the API is unreachable.';
    }
    if (err.status === 401 || err.status === 403) {
      return 'Map data is not publicly accessible yet. Please ask an admin to allow public report listing.';
    }
    return 'Unable to load report locations right now.';
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
