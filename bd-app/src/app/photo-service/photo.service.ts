import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  private apiUrl = 'http://localhost:3000/photos';

  constructor(private http: HttpClient) {}

  uploadPhoto(username: string, password: string, target: string, check: string): Observable<any> {
    const body = { username, password, target, check };
    return this.http.post(`${this.apiUrl}/upload`, body);
  }

  getUsersSimilarity(target: string): Observable<any> {
    const url = `${this.apiUrl}/similar/${target}`;
    return this.http.get(url);
  }

  getUserPhotos(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${userId}`);
  }
}