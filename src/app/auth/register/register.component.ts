import { Component, inject, AfterViewInit, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { CommonModule } from '@angular/common';
import { RegisterRequest } from '../../models/request/register-request.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, AfterViewInit {

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  invitationKey: string | null = null;
  invitedEmail: string | null = null;
  isInvitationMode = false;

  form = new FormGroup(
    {
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      login: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)]
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email]
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(6)]
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
    },
    { validators: [this.passwordMatchValidator] }
  );

  get firstName() { return this.form.get('firstName'); }
  get lastName() { return this.form.get('lastName'); }
  get login() { return this.form.get('login'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }
  get confirmPassword() { return this.form.get('confirmPassword'); }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.invitationKey = params.get('key');
      this.invitedEmail = params.get('email');
      this.isInvitationMode = !!this.invitationKey;

      if (this.isInvitationMode) {
        if (this.invitedEmail) {
          this.email?.setValue(this.invitedEmail);
        }
        this.email?.disable({ emitEvent: false });
      } else {
        this.router.navigate(['/login'], { queryParams: { error: 'missing_invitation' } });
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const raw = this.form.getRawValue();

    const request: RegisterRequest = {
      key: this.invitationKey ?? undefined,
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      login: raw.login.trim(),
      email: raw.email.trim(),
      password: raw.password
    };

    this.authService.register(request).subscribe({
      next: (message: string) => {
        this.isLoading = false;
        this.successMessage = message || 'Account activated successfully. You can now sign in.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1800);
      },
      error: (error) => {
        this.isLoading = false;

        const backendMessage =
          typeof error?.error === 'string' ? error.error : null;

        this.errorMessage =
          backendMessage ||
          (this.isInvitationMode
            ? 'Invitation completion failed. The link may be invalid or expired.'
            : 'Registration failed.');
      }
    });
  }

  ngAfterViewInit(): void {
    const canvas = document.getElementById('cv') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const pts: Array<{ x: number; y: number; vx: number; vy: number; r: number; a: number }> = [];

    for (let i = 0; i < 50; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 0.6,
        a: Math.random() * 0.4 + 0.1
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

        pts[i].x += pts[i].vx;
        pts[i].y += pts[i].vy;

        if (pts[i].x < 0 || pts[i].x > W) pts[i].vx *= -1;
        if (pts[i].y < 0 || pts[i].y > H) pts[i].vy *= -1;
      }

      requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener('resize', () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    });
  }
}