import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../core/category.service';
import { Category } from '../core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css'],
})
export class CategoryManagementComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly snackBar = inject(MatSnackBar);

  protected categories$!: Observable<Category[]>;
  protected isLoading = true;
  protected readonly displayedColumns = ['nom', 'description', 'prioriteParDefaut', 'actions'];

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.categories$ = this.categoryService.getCategories();
    this.categories$.subscribe({
      next: () => (this.isLoading = false),
      error: (err) => {
        console.error('Error loading categories:', err);
        this.isLoading = false;
      },
    });
  }

  addCategory(): void {
    const nom = prompt('Category name:');
    if (nom === null || !nom.trim()) {
      return;
    }

    const description = prompt('Category description (optional):', '') ?? '';
    const priorityInput = (
      prompt('Default priority (LOW, MEDIUM, HIGH, URGENT):', 'MEDIUM') ?? 'MEDIUM'
    )
      .trim()
      .toUpperCase();
    const allowed = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
    const prioriteParDefaut = (allowed as readonly string[]).includes(priorityInput)
      ? (priorityInput as (typeof allowed)[number])
      : 'MEDIUM';

    this.categoryService
      .createCategory({
        nom: nom.trim(),
        description: description.trim() || undefined,
        prioriteParDefaut,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Category created successfully.', 'Close', { duration: 3000 });
          this.loadCategories();
        },
        error: (err) => {
          console.error('Error creating category:', err);
          this.snackBar.open(
            err?.error?.detail ?? err?.error?.['hydra:description'] ?? 'Failed to create category.',
            'Close',
            { duration: 5000 },
          );
        },
      });
  }

  editCategory(category: Category): void {
    const newName = prompt('Edit category name:', category.nom);
    if (newName === null) {
      return; // User cancelled
    }

    const newDescription = prompt('Edit category description:', category.description ?? '');
    if (newDescription === null) {
      return; // User cancelled
    }

    this.categoryService.updateCategory(category.id!, { nom: newName, description: newDescription }).subscribe({
      next: () => {
        this.snackBar.open('Category updated successfully.', 'Close', { duration: 3000 });
        this.loadCategories();
      },
      error: (err) => {
        console.error('Error updating category:', err);
        this.snackBar.open('Failed to update category.', 'Close', { duration: 5000 });
      },
    });
  }

  deleteCategory(category: Category): void {
    if (!confirm(`Are you sure you want to delete category "${category.nom}"?`)) {
      return;
    }

    this.categoryService.deleteCategory(category.id!).subscribe({
      next: () => {
        this.snackBar.open('Category deleted successfully.', 'Close', { duration: 3000 });
        this.loadCategories();
      },
      error: (err) => {
        console.error('Error deleting category:', err);
        this.snackBar.open('Failed to delete category.', 'Close', { duration: 5000 });
      },
    });
  }
}

