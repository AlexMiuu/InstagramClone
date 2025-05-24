import { Component } from "@angular/core"
import { FeedFormHeaderComponent } from "../../app/components/feed-form-header/feed-form-header.component"
import { RouterModule } from "@angular/router"
import { FeedFormComponent } from "../../app/components/feed-form/feed-form.component"

@Component({
  selector: "app-feed",
  imports: [FeedFormHeaderComponent, FeedFormComponent, RouterModule],
  templateUrl: "./feed.component.html",
  styleUrl: "./feed.component.css",
  standalone: true,
})
export class FeedComponent {}
