import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activate.component.html',
  styleUrl: './activate.component.css'
})
export class ActivateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  status: 'loading' | 'success' | 'error' = 'loading';
  message = '';

ngOnInit() {
  this.route.queryParams.subscribe(params => {
    const token = params['token'];
    const error = params['error'];

    if (error) {
      this.status = 'error';
      this.message = 'Invalid activation link.';
      return;
    }

    if (token) {
      // Spring Boot already activated the account
      // before redirecting here — just show success
      this.status = 'success';
      this.message = 'Your account has been activated successfully!';
    } else {
      this.status = 'error';
      this.message = 'Invalid activation link. No token found.';
    }
  });
}

  private activateAccount(token: string): void {
    const url = `http://localhost:8081/api/v1/activate?token=${token}`;
    const options = {
      responseType: 'text' as const,
      headers: new HttpHeaders({ 'skipInterceptor': 'true' })
    };

    this.http.get(url, options).subscribe({
      next: () => {
        this.status = 'success';
        this.message = 'Your account has been activated successfully!';
      },
      error: () => {
        this.status = 'error';
        this.message = 'Activation failed. Your link may have expired.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}