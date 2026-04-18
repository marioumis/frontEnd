import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DeptAdminSidebarComponent } from '../sidebar/dept-admin-sidebar.component';

@Component({
  selector: 'app-dept-admin-layout',
  standalone: true,
  imports: [RouterOutlet, DeptAdminSidebarComponent],
  templateUrl: './dept-admin-layout.component.html',
  styleUrl: './dept-admin-layout.component.css'
})
export class DeptAdminLayoutComponent {}
