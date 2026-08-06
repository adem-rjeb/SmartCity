import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { UserRole } from './models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected errorMessage = '';
  protected isSubmitting = false;

  protected readonly form = this.fb.nonNullable.group({
    email: ['citizen@example.com', [Validators.required, Validators.email]],
    password: ['password', Validators.required],
  });

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
}
