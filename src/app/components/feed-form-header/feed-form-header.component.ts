import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feed-form-header',
  imports: [MenubarModule, ButtonModule, InputTextModule, CommonModule],
  templateUrl: './feed-form-header.component.html',
  styleUrl: './feed-form-header.component.css',
  standalone: true
})
export class FeedFormHeaderComponent {
  items: MenuItem[] = [
    {
      icon: 'pi pi-home'
    },
    {
      icon: 'pi pi-compass'
    },
    {
      icon: 'pi pi-plus'
    },
    {
      icon: 'pi pi-send'
    },
    {
      icon: 'pi pi-heart'
    },
    {
      icon: 'pi pi-user'
    }
  ];
}
