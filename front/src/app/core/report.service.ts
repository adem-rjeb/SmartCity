import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { CreateReportPayload, Report } from './models';

interface HydraCollection<T> {
  'hydra:member': T[];
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  getReports(): Observable<Report[]> {
    return this.api.get<any>('/reports').pipe(
      map((res) => {
        if (Array.isArray(res)) return res as Report[];
        return (res?.['hydra:member'] ?? res?.member ?? []) as Report[];
      }),
    );
  }

  getReport(id: number): Observable<Report> {
    return this.api.get<Report>(`/reports/${id}`);
  }

  getMyReports(): Observable<Report[]> {
    const userId = this.auth.getUserId();
    return this.getReports().pipe(
      map((reports) => {
        if (!userId) return [] as Report[];
        return reports.filter((r) => {
          const creator = r.creator as any;
          if (!creator) return false;
          if (typeof creator === 'object' && creator.id) return creator.id === userId;
          if (typeof creator === 'string') {
            const m = creator.match(/\/(\d+)$/);
            return !!m && Number(m[1]) === userId;
          }
          return false;
        });
      }),
    );
  }

  createReport(payload: CreateReportPayload): Observable<Report> {
    const { photo, ...rest } = payload;
    // Backend ReportCreateAction expects `category` to be the numeric id.
    const categoryId = rest.category;

    if (photo) {
      // The backend currently doesn't accept multipart uploads in the create action;
      // we will send the report without the photo and let the app handle photo upload separately.
      console.warn('Photo provided but will be ignored: backend does not support multipart in report create');
    }

    if (photo) {
      const form = new FormData();
      form.append('titre', rest.titre);
      form.append('description', rest.description);
      form.append('adresse', rest.adresse);
      form.append('latitude', String(rest.latitude));
      form.append('longitude', String(rest.longitude));
      form.append('category', String(categoryId));
      form.append('photo', photo, photo.name);
      return this.api.post<Report>('/reports', form);
    }

    const body = { ...rest, category: categoryId };
    return this.api.post<Report>('/reports', body);
  }

  updateStatus(reportId: number, status: string): Observable<Report> {
    return this.api.patch<Report>(`/reports/${reportId}`, { status });
  }
}
