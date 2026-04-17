import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  navItems = [
    {
      label: 'Dashboard',
      route: '/admin/dashboard',
      icon: 'dashboard'
    },
    {
      label: 'Users',
      route: '/admin/users',
      icon: 'users'
    },
    {
      label: 'Departments',
      route: '/admin/departments',
      icon: 'departments'
    },
    {
      label: 'Categories',
      route: '/admin/categories',
      icon: 'categories'
    },
    {
      label: 'Settings',
      route: '/admin/settings',
      icon: 'settings'
    },
     {
      label: 'Templates',
      route: '/admin/templates',
      icon: 'templates'
    }
  ];

  logout() {
    this.authService.logout();
  }

}