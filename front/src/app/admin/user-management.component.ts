import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../core/user.service';
import { User } from '../core/models';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserFormComponent } from './user-form.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private readonly usersSubject = new BehaviorSubject<User[]>([]);
  protected readonly filterSubject = new BehaviorSubject<string>('ALL');
  protected readonly searchSubject = new BehaviorSubject<string>('');

  protected isLoading = true;
  protected activeFilter = 'ALL';
  protected searchQuery = '';
  protected filteredUsers$!: Observable<User[]>;
  protected readonly displayedColumns = ['nom', 'email', 'role', 'actions'];

  protected counts = {
    all: 0,
    citizens: 0,
    agents: 0,
    admins: 0,
  };

  ngOnInit(): void {
    this.loadUsers();

    this.filteredUsers$ = combineLatest([
      this.usersSubject,
      this.filterSubject,
      this.searchSubject,
    ]).pipe(
      map(([users, filter, search]) => {
        const query = search.toLowerCase().trim();

        return users.filter((u) => {
          let matchesRole = true;
          if (filter !== 'ALL') {
            matchesRole = u.role === filter;
          }

          let matchesSearch = true;
          if (query) {
            const nom = u.nom?.toLowerCase() ?? '';
            const email = u.email?.toLowerCase() ?? '';
            const role = u.role?.toLowerCase() ?? '';
            matchesSearch = nom.includes(query) || email.includes(query) || role.includes(query);
          }

          return matchesRole && matchesSearch;
        });
      }),
    );
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (list) => {
        this.usersSubject.next(list);
        this.computeCounts(list);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.isLoading = false;
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
      },
    });
  }

  private computeCounts(list: User[]): void {
    this.counts.all = list.length;
    this.counts.citizens = list.filter((u) => u.role === 'ROLE_CITIZEN').length;
    this.counts.agents = list.filter((u) => u.role === 'ROLE_AGENT').length;
    this.counts.admins = list.filter((u) => u.role === 'ROLE_ADMIN' || u.role === 'ROLE_SUPER_ADMIN').length;
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterSubject.next(filter);
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  openUserForm(user?: User): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '420px',
      data: { user },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.nom}?`)) {
      this.userService.deleteUser(user.id!).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          this.snackBar.open('Failed to delete user', 'Close', { duration: 3000 });
        },
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ROLE_CITIZEN':
        return 'role-badge role-citizen';
      case 'ROLE_AGENT':
        return 'role-badge role-agent';
      case 'ROLE_ADMIN':
        return 'role-badge role-admin';
      case 'ROLE_SUPER_ADMIN':
        return 'role-badge role-superadmin';
      default:
        return 'role-badge';
    }
  }

  formatRole(role: string): string {
    return role.replace('ROLE_', '').replace('_', ' ');
  }
}
