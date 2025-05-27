import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { TestRunnerComponent } from "./test-runner.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: "", component: TestRunnerComponent }]),
    TestRunnerComponent,
  ],
  exports: [TestRunnerComponent],
})
export class TestRunnerModule {}
