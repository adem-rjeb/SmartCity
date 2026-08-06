import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as L from 'leaflet';
import { ReportService } from '../core/report.service';
import { CategoryService } from '../core/category.service';
import { Category, CreateReportPayload } from '../core/models';
import { Observable } from 'rxjs';

const DEFAULT_LAT = 36.81897;
const DEFAULT_LNG = 10.16579;
const DEFAULT_ZOOM = 14;

// Leaflet's default icon URLs break under Angular's bundler — pin absolute asset paths.
const DefaultIcon = L.icon({
  iconUrl: '/assets/leaflet/marker-icon.png',
  iconRetinaUrl: '/assets/leaflet/marker-icon-2x.png',
  shadowUrl: '/assets/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

@Component({
  selector: 'app-report-creation-form',
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
  templateUrl: './report-creation-form.component.html',
  styleUrls: ['./report-creation-form.component.css'],
})
export class ReportCreationFormComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly reportService = inject(ReportService);
  private readonly categoryService = inject(CategoryService);
  private readonly zone = inject(NgZone);

  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLDivElement>;

  private map?: L.Map;
  private marker?: L.Marker;

  protected readonly form = this.fb.nonNullable.group({
    categoryId: [1, Validators.required],
    titre: ['', Validators.required],
    description: ['', Validators.required],
    adresse: ['', Validators.required],
    latitude: [DEFAULT_LAT, Validators.required],
    longitude: [DEFAULT_LNG, Validators.required],
  });

  protected categories$!: Observable<Category[]>;
  protected isSubmitting = false;
  protected selectedFileName = '';
  private selectedPhoto: File | null = null;

  ngOnInit(): void {
    this.categories$ = this.categoryService.getCategories();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = undefined;
    this.marker = undefined;
  }

  private initMap(): void {
    const lat = this.form.controls.latitude.value;
    const lng = this.form.controls.longitude.value;

    this.zone.runOutsideAngular(() => {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: [lat, lng],
        zoom: DEFAULT_ZOOM,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(this.map);

      this.marker = L.marker([lat, lng], { draggable: true, icon: DefaultIcon }).addTo(this.map);

      this.marker.on('dragend', () => {
        const pos = this.marker!.getLatLng();
        this.zone.run(() => this.setCoordinates(pos.lat, pos.lng, false));
      });

      this.map.on('click', (e: L.LeafletMouseEvent) => {
        this.marker!.setLatLng(e.latlng);
        this.zone.run(() => this.setCoordinates(e.latlng.lat, e.latlng.lng, false));
      });

      // Ensure tiles render correctly inside the card layout
      setTimeout(() => this.map?.invalidateSize(), 0);
    });
  }

  private setCoordinates(lat: number, lng: number, moveMarker: boolean): void {
    this.form.patchValue({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    });

    if (moveMarker && this.marker && this.map) {
      this.marker.setLatLng([lat, lng]);
      this.map.panTo([lat, lng]);
    }
  }

  detectGeolocation(): void {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setCoordinates(position.coords.latitude, position.coords.longitude, true);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to detect your location. Drag the marker or click the map instead.');
      },
    );
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedPhoto = input.files[0];
      this.selectedFileName = this.selectedPhoto.name;
    }
  }

  resetForm(): void {
    this.form.reset({
      categoryId: 1,
      titre: '',
      description: '',
      adresse: '',
      latitude: DEFAULT_LAT,
      longitude: DEFAULT_LNG,
    });
    this.selectedPhoto = null;
    this.selectedFileName = '';
    this.setCoordinates(DEFAULT_LAT, DEFAULT_LNG, true);
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    const payload: CreateReportPayload = {
      titre: this.form.value.titre!,
      description: this.form.value.description!,
      adresse: this.form.value.adresse!,
      latitude: this.form.value.latitude!,
      longitude: this.form.value.longitude!,
      category: this.form.value.categoryId!,
      photo: this.selectedPhoto || undefined,
    };

    this.reportService.createReport(payload).subscribe({
      next: () => {
        alert('Report submitted successfully!');
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Report submission error:', err);
        const message = err?.error?.error || 'Error submitting report. Please try again.';
        alert(message);
        this.isSubmitting = false;
      },
    });
  }
}
