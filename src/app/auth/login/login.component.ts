import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  submit() {
    if (this.form.invalid) {this.form.markAllAsTouched();
    this.errorMessage = 'Please fill in the form correctly.';
    return;};

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(
      this.form.value.email!,
      this.form.value.password!

    ).subscribe({
   next: (response) => {
      this.isLoading = false;

      if (response.role === 'ADMIN' )  {
        this.router.navigate(['/admin/dashboard']);
      } else if (response.role === 'DEPT_ADMIN') {
        this.router.navigate(['/dept-admin/users']);
      } else {
        this.router.navigate(['/user/home']);
      }
    },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Invalid email or password. Please try again.';
      }
    });
  }

}
