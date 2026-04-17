import { Component, inject, AfterViewInit, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { CommonModule } from '@angular/common';
import { RegisterRequest } from '../../models/request/register-request.model';
import { DepartmentResponse } from '../../models/response/department-response.model';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements AfterViewInit {

  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    login: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', Validators.required),
  }, { validators: this.passwordMatchValidator });

  get firstName() { return this.form.get('firstName'); }
  get lastName() { return this.form.get('lastName'); }
  get login() { return this.form.get('login'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }


  passwordMatchValidator(form: any) {
    const password = form.get('password').value;
    const confirm = form.get('confirmPassword').value;
    return password === confirm ? null : { passwordMismatch: true };
  }


  submit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: RegisterRequest = {
      firstName: this.form.value.firstName!,
      lastName: this.form.value.lastName!,
      login: this.form.value.login!,
      email: this.form.value.email!,
      password: this.form.value.password!,
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Account created! Please check your email to activate your account.';
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Registration failed. This email may already be in use.';
      }
    });
  }
  ngAfterViewInit() {
    const canvas = document.getElementById('cv') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const pts: any[] = [];

    for (let i = 0; i < 50; i++) {
      pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
        r: Math.random() * 1.8 + 0.6, a: Math.random() * .4 + .1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(96,165,250,${0.25 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${pts[i].a})`;
        ctx.fill();
        pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
        if (pts[i].x < 0 || pts[i].x > W) pts[i].vx *= -1;
        if (pts[i].y < 0 || pts[i].y > H) pts[i].vy *= -1;
      }
      requestAnimationFrame(draw);
    };
    draw();
  }
}