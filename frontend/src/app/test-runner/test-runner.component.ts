import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { PostService } from "../services/post.service";
import { TagService } from "../services/tag.service";
import { AuthService } from "../services/auth.service";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-test-runner",
  template: "<div>Test Runner Loaded</div>", // minimal template
})
export class TestRunnerComponent {
  constructor(
    private http: HttpClient,
    private postService: PostService,
    private tagService: TagService,
    private authService: AuthService
  ) {
    // Expose this component to Cypress via window
    (window as any).testRunner = this;
  }
  // Example: Call backend test endpoint
  async callHello(): Promise<string> {
    const result = await firstValueFrom(
      this.http.get(`${environment.apiUrl}/test-api/hello`, { responseType: "text" })
    );
    return result ?? "";
  }

  async callEcho(msg: string): Promise<string> {
    const result = await firstValueFrom(
      this.http.post(`${environment.apiUrl}/test-api/echo`, msg, { responseType: "text" })
    );
    return result ?? "";
  }

  // Example: Call a real service method
  async getAllPosts(): Promise<any> {
    return await firstValueFrom(this.postService.getPosts());
  }

  async getAllTags(): Promise<any> {
    return await firstValueFrom(this.tagService.getTags());
  }

  // Add more service calls as needed
}
