import { Component, EventEmitter, Output } from '@angular/core';
import { PhotoService } from '../../photo-service/photo.service';

@Component({
  selector: 'app-photo-upload',
  templateUrl: './photo-upload.component.html',
  styleUrls: ['./photo-upload.component.scss'],
})
export class PhotoUploadComponent {
  username: string = "bakalaurinis";
  password: string = "Bakalauras2023$";
  target: string = "";
  isCheckLoading = false;
  checkSuccess: boolean = false;
  checkError: boolean = false;
  isLoading = false;
  uploadSuccess: boolean = false;
  uploadError: boolean = false;
  userPhotos: any[] = [];
  userPhotoObjectsByFrequency: { [key: string]: number } = {};
  userPhotoObjectsByRelativeSize: { [key: string]: number } = {};
  uploadComplete = false;

  userData: { username: string, photos: any[], frequencies: { [key: string]: number }, sizes: { [key: string]: number } }[] = [];

  @Output() uploadCompleted = new EventEmitter<boolean>();
  @Output() targetsUpdated = new EventEmitter<string[]>();

  constructor(private photoService: PhotoService) {}

  checkUser(): void {
    if (this.username && this.password && this.target) {
      this.isCheckLoading = true;
      this.checkSuccess = false;
      this.checkError = false;

      this.photoService.uploadPhoto(this.username, this.password, this.target, "true").subscribe(
        (response) => {
          this.isCheckLoading = false;
          this.checkSuccess = true;
          this.addTarget();
          this.target = "";
        },
        (error) => {
          this.isCheckLoading = false;
          this.checkError = true;
        }
      );
    }
  }

  oldUploadUsers(): void {
    this.isLoading = true;
    this.uploadSuccess = false;
    this.uploadError = false;
    let uploadCount = 0;

    for (let item of this.targets) {
      this.photoService.uploadPhoto(this.username, this.password, item, "false").subscribe(
        (response) => {
          uploadCount++;
          this.getUserPhotos(item);

          if (uploadCount === this.targets.length) {
            this.isLoading = false;
            this.uploadSuccess = true;
            this.uploadComplete = true;
            this.uploadCompleted.emit(true);
            this.targetsUpdated.emit(this.targets);
          }
        },
        (error) => {
          this.isLoading = false;
          this.uploadError = true;
        }
      );
    }

  }

  async uploadUsers(): Promise<void> {
    this.isLoading = true;
    this.uploadSuccess = false;
    this.uploadError = false;
    let uploadCount = 0;
  
    for (let item of this.targets) {
      try {
        const response = await this.photoService.uploadPhoto(this.username, this.password, item, "false").toPromise();
        uploadCount++;
        this.getUserPhotos(item);
  
        if (uploadCount === this.targets.length) {
          this.isLoading = false;
          this.uploadSuccess = true;
          this.uploadComplete = true;
          this.uploadCompleted.emit(true);
          this.targetsUpdated.emit(this.targets);
        }
      } catch (error) {
        this.isLoading = false;
        this.uploadError = true;
      }
    }
  }

    getUserPhotos(target: string): void {
      this.photoService.getUserPhotos(target).subscribe(
        (photos) => {
          const userPhotos = photos;
          const userPhotoObjectsByFrequency: { [key: string]: number } = {};
          const userPhotoObjectsByRelativeSize: { [key: string]: number } = {};
  
          userPhotos.forEach((photo: { objects: { objectName: any; confidenceScore: any; }[]; }) => {
            photo.objects.forEach((obj: { objectName: any; confidenceScore: any;}) => {
              const objectName = obj.objectName;
              const confidenceScore = obj.confidenceScore;
              userPhotoObjectsByFrequency[objectName] = userPhotoObjectsByFrequency[objectName] ? userPhotoObjectsByFrequency[objectName] + 1 : 1;
              userPhotoObjectsByRelativeSize[objectName] = userPhotoObjectsByRelativeSize[objectName] ? userPhotoObjectsByRelativeSize[objectName] + confidenceScore : confidenceScore;
            });
          });
  
          this.userData.push({
            username: target,
            photos: userPhotos,
            frequencies: userPhotoObjectsByFrequency,
            sizes: userPhotoObjectsByRelativeSize
          });
        },
        (error) => {
          console.error(error);
        }
      );
    }
  

  objectKeys(obj: {}) {
    return Object.keys(obj);
  }

  targets: string[] = [];

  addTarget() {
    if (this.target && this.targets.indexOf(this.target) === -1) {
      this.targets.push(this.target);
    }
  }

  deleteTarget(index: number) {
    this.targets.splice(index, 1);
  }
}