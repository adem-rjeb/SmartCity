import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { User } from '../core/models';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <div class="profile-page">
      <div class="profile-header">
        <div class="avatar-section">
          <div class="avatar-ring">
            <div class="avatar">
              <span class="material-icons avatar-icon">person</span>
            </div>
          </div>
          <div class="avatar-badge">
            <span class="material-icons">edit</span>
          </div>
        </div>
        <div class="profile-info">
          <h1 class="profile-title">My Profile</h1>
          <p class="profile-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div class="profile-content">
        <div class="info-card">
          <div class="card-header">
            <div class="card-icon">
              <span class="material-icons">account_circle</span>
            </div>
            <h2 class="card-title">Personal Information</h2>
          </div>
          <form [formGroup]="form" class="profile-form">
            <div class="form-group">
              <label class="form-label">
                <span class="material-icons label-icon">person</span>
                Full Name
              </label>
              <mat-form-field appearance="fill" class="form-field">
                <input matInput formControlName="nom" placeholder="Enter your full name" />
              </mat-form-field>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="material-icons label-icon">email</span>
                Email Address
              </label>
              <mat-form-field appearance="fill" class="form-field">
                <input matInput type="email" formControlName="email" placeholder="Enter your email" />
              </mat-form-field>
            </div>
          </form>
        </div>

        <div class="security-card">
          <div class="card-header">
            <div class="card-icon security-icon">
              <span class="material-icons">security</span>
            </div>
            <h2 class="card-title">Security Settings</h2>
          </div>
          <form [formGroup]="form" class="password-form">
            <div class="form-group">
              <label class="form-label">
                <span class="material-icons label-icon">lock</span>
                New Password
              </label>
              <mat-form-field appearance="fill" class="form-field">
                <input
                  matInput
                  type="password"
                  formControlName="plainPassword"
                  placeholder="Leave blank to keep current password"
                />
                <mat-error *ngIf="form.get('plainPassword')?.value && (form.get('plainPassword')?.value?.length ?? 0) < 8">
                  Password must be at least 8 characters
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="material-icons label-icon">verified_user</span>
                Confirm Password
              </label>
              <mat-form-field appearance="fill" class="form-field">
                <input
                  matInput
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="Confirm your new password"
                />
                <mat-error *ngIf="passwordMismatch">
                  Passwords do not match
                </mat-error>
              </mat-form-field>
            </div>
          </form>
        </div>

        <div class="action-bar">
          <button
            mat-flat-button
            class="save-button"
            [disabled]="isFormInvalid() || isSubmitting"
            (click)="saveProfile()"
          >
            <span class="material-icons button-icon" *ngIf="!isSubmitting">save</span>
            <mat-spinner *ngIf="isSubmitting" diameter="20" class="button-spinner"></mat-spinner>
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .profile-page {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
        min-height: 100vh;
        border-radius: 2rem;
      }

      .profile-header {
        display: flex;
        align-items: center;
        gap: 2rem;
        margin-bottom: 2.5rem;
        padding: 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 1.5rem;
        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        position: relative;
        overflow: hidden;
      }

      .profile-header::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        animation: float 6s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(-20px, 20px); }
      }

      .avatar-section {
        position: relative;
        z-index: 1;
      }

      .avatar-ring {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        padding: 4px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }

      .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .avatar-icon {
        font-size: 48px !important;
        color: white;
      }

      .avatar-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 32px;
        height: 32px;
        background: #10b981;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .avatar-badge .material-icons {
        font-size: 16px !important;
        color: white;
      }

      .profile-info {
        position: relative;
        z-index: 1;
        flex: 1;
      }

      .profile-title {
        font-size: 2rem;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 0.5rem 0;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .profile-subtitle {
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.95);
        margin: 0;
        font-weight: 400;
      }

      .profile-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .info-card, .security-card {
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
        border-radius: 1rem;
        padding: 2rem;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        border: 1px solid rgba(102, 126, 234, 0.4);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .info-card:hover, .security-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid rgba(102, 126, 234, 0.3);
      }

      .card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }

      .card-icon .material-icons {
        font-size: 24px !important;
        color: #ffffff;
      }

      .security-icon {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
      }

      .card-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: #e0e7ff;
        margin: 0;
      }

      .profile-form, .password-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        color: #c7d2fe;
      }

      .label-icon {
        font-size: 18px !important;
        color: #818cf8;
      }

      .form-field {
        width: 100%;
      }

      .form-field ::ng-deep .mat-mdc-form-field {
        width: 100%;
      }

      .form-field ::ng-deep .mat-mdc-text-field-wrapper {
        background: linear-gradient(135deg, #1e1e3f 0%, #2a2a4a 100%);
        border-radius: 0.75rem;
        padding: 0.5rem 1rem;
        border: 1px solid rgba(102, 126, 234, 0.3);
      }

      .form-field ::ng-deep .mat-mdc-form-field-input-control {
        font-size: 0.95rem;
        color: #e0e7ff;
      }

      .form-field ::ng-deep .mat-mdc-form-field-input-control::placeholder {
        color: #a5b4fc;
      }

      .form-field ::ng-deep .mat-mdc-form-field-label {
        color: #a5b4fc !important;
      }

      .form-field ::ng-deep .mat-mdc-form-field-label.mdc-floating-label {
        color: #c7d2fe !important;
      }

      .form-field ::ng-deep .mat-mdc-text-field-wrapper .mat-mdc-form-field-subscript-wrapper {
        color: #a5b4fc;
      }

      .form-field ::ng-deep .mat-mdc-text-field-wrapper input {
        color: #e0e7ff !important;
      }

      .form-field ::ng-deep .mat-mdc-text-field-wrapper input::placeholder {
        color: #a5b4fc !important;
      }

      .form-field ::ng-deep .mat-mdc-form-field-error {
        color: #f87171 !important;
      }

      .action-bar {
        display: flex;
        justify-content: flex-end;
        padding: 1rem 0;
      }

      .save-button {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 0.75rem 2rem;
        border-radius: 0.75rem;
        font-weight: 600;
        font-size: 1rem;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .save-button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      }

      .save-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .button-icon {
        font-size: 20px !important;
      }

      .button-spinner {
        color: white;
      }

      @media (max-width: 768px) {
        .profile-page {
          padding: 1rem;
        }

        .profile-header {
          flex-direction: column;
          text-align: center;
          padding: 1.5rem;
        }

        .profile-title {
          font-size: 1.5rem;
        }

        .info-card, .security-card {
          padding: 1.5rem;
        }

        .card-header {
          flex-direction: column;
          text-align: center;
        }
      }
    `,
  ],
})
export class MyProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);

  protected isSubmitting = false;
  protected userId: number | null = null;

  protected readonly form = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    plainPassword: [''],
    confirmPassword: [''],
  });

  ngOnInit(): void {
    this.userId = this.auth.getUserId();
    if (this.userId) {
      this.loadUserProfile();
    } else {
      this.snackBar.open('Unable to load user profile', 'Close', { duration: 3000 });
    }
  }

  get passwordMismatch(): boolean {
    const plainPassword = this.form.get('plainPassword')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;

    // Only show mismatch if both fields are filled and don't match
    return !!(plainPassword && confirmPassword && plainPassword !== confirmPassword);
  }

  isFormInvalid(): boolean {
    // Form is invalid if required fields are missing or if passwords don't match when they're being changed
    const nom = this.form.get('nom')?.value;
    const email = this.form.get('email')?.value;
    const plainPassword = this.form.get('plainPassword')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;

    // Required fields must be filled
    if (!nom || !email) {
      return true;
    }

    // Email must be valid
    const emailControl = this.form.get('email');
    if (emailControl?.hasError('email')) {
      return true;
    }

    // If password is being changed, it must be valid
    if (plainPassword || confirmPassword) {
      if (plainPassword && plainPassword.length < 8) {
        return true;
      }
      if (this.passwordMismatch) {
        return true;
      }
    }

    return false;
  }

  loadUserProfile(): void {
    if (!this.userId) return;

    this.api.get<User>(`/users/${this.userId}`).subscribe({
      next: (user) => {
        this.form.patchValue({
          nom: user.nom,
          email: user.email,
        });
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.snackBar.open('Failed to load profile', 'Close', { duration: 3000 });
      },
    });
  }

  saveProfile(): void {
    if (this.isFormInvalid() || !this.userId) {
      return;
    }

    const formValue = this.form.getRawValue();

    this.isSubmitting = true;

    // Build payload with only changed fields
    const payload: any = {
      nom: formValue.nom,
      email: formValue.email,
    };

    // Only include password if it's being changed
    if (formValue.plainPassword) {
      payload.plainPassword = formValue.plainPassword;
    }

    this.api.patch<User>(`/users/${this.userId}/profile`, payload).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        this.form.patchValue({
          plainPassword: '',
          confirmPassword: '',
        });
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.snackBar.open(err?.error?.detail ?? 'Failed to update profile', 'Close', { duration: 5000 });
        this.isSubmitting = false;
      },
    });
  }
}
