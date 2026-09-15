import { Component, Inject, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../core/user.service';
import { User, UserRole } from '../core/models';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.user ? 'Edit User' : 'Add User' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="user-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput formControlName="nom" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input matInput type="email" formControlName="email" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Role</mat-label>
          <mat-icon matPrefix>badge</mat-icon>
          <mat-select formControlName="role" required>
            <mat-option *ngFor="let role of roles" [value]="role.value">
              {{ role.label }}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <mat-icon matPrefix>lock</mat-icon>
          <input
            matInput
            type="password"
            formControlName="plainPassword"
            [placeholder]="data.user ? 'Leave blank to keep current' : ''"
          />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="form.invalid || isSubmitting"
        (click)="saveUser()"
      >
        <mat-spinner *ngIf="isSubmitting" diameter="20"></mat-spinner>
        {{ isSubmitting ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .user-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding-top: 8px;
      }
      .full-width {
        width: 100%;
      }
    `,
  ],
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);

  protected isSubmitting = false;

  protected readonly roles = [
    { value: 'ROLE_CITIZEN', label: 'Citizen' },
    { value: 'ROLE_AGENT', label: 'Agent' },
    { value: 'ROLE_ADMIN', label: 'Admin' },
    { value: 'ROLE_SUPER_ADMIN', label: 'Super Admin' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['ROLE_CITIZEN' as UserRole, Validators.required],
    plainPassword: [''], // Required handled dynamically
  });

  constructor(
    public dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User },
  ) {}

  ngOnInit(): void {
    if (this.data.user) {
      this.form.patchValue({
        nom: this.data.user.nom,
        email: this.data.user.email,
        role: this.data.user.role,
      });
      // Password is not required when editing
    } else {
      // Password is required when creating
      this.form.controls.plainPassword.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.controls.plainPassword.updateValueAndValidity();
    }
  }

  saveUser(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.getRawValue();

    if (this.data.user) {
      // Update
      const payload: any = {
        nom: formValue.nom,
        email: formValue.email,
        role: formValue.role,
      };
      if (formValue.plainPassword) {
        payload.plainPassword = formValue.plainPassword;
      }

      this.userService.updateUser(this.data.user.id!, payload).subscribe({
        next: () => {
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error updating user:', err);
          this.snackBar.open(err?.error?.detail ?? 'Failed to update user', 'Close', { duration: 5000 });
          this.isSubmitting = false;
        },
      });
    } else {
      // Create
      this.userService.createUser(formValue as any).subscribe({
        next: () => {
          this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error creating user:', err);
          this.snackBar.open(err?.error?.detail ?? 'Failed to create user', 'Close', { duration: 5000 });
          this.isSubmitting = false;
        },
      });
    }
  }
}
