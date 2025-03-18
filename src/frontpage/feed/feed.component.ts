import { Component } from '@angular/core';
import { FeedFormHeaderComponent } from "../../app/components/feed-form-header/feed-form-header.component";
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-feed',
  imports: [FeedFormHeaderComponent, RouterOutlet],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
  standalone: true

})
export class FeedComponent {

}
