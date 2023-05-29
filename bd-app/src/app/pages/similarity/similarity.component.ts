import { Component } from '@angular/core';

@Component({
  selector: 'app-similarity',
  templateUrl: './similarity.component.html',
  styleUrls: ['./similarity.component.scss']
})
export class SimilarityComponent {
  isUploadCompleted = false;
  targets: string[] = [];

  onUploadCompleted(event: boolean) {
    this.isUploadCompleted = event;
  }

  onTargetsUpdated(targets: string[]): void {
    this.targets = targets;
  }
}