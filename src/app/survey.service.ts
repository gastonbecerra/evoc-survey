import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private surveyUrl = 'assets/survey.json';

  constructor(private http: HttpClient) {}

  getSurveyData(): Observable<any> {
    return this.http.get<any>(this.surveyUrl);
  }
}
