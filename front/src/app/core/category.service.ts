import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Category } from './models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);

  getCategories(): Observable<Category[]> {
    // ApiPlatform may return a JSON-LD collection with `member` or `hydra:member`.
    return this.api.get<any>('/categories').pipe(
      map((res) => {
        if (Array.isArray(res)) return res as Category[];
        return (res?.member ?? res?.['hydra:member'] ?? []) as Category[];
      }),
    );
  }

  getCategory(id: number): Observable<Category> {
    return this.api.get<Category>(`/categories/${id}`);
  }

  createCategory(payload: Omit<Category, 'id'>): Observable<Category> {
    // TODO: ensure this endpoint requires ADMIN role.
    return this.api.post<Category>('/categories', payload);
  }

  updateCategory(id: number, payload: Partial<Category>): Observable<Category> {
    return this.api.put<Category>(`/categories/${id}`, payload);
  }

  deleteCategory(id: number): Observable<void> {
    return this.api.delete<void>(`/categories/${id}`);
  }
}
