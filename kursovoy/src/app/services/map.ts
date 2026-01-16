import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getEventsInRadius(lat: number, lng: number, radius: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/events/nearby`, {
      params: { lat: lat.toString(), lng: lng.toString(), radius: radius.toString() }
    });
  }

  geocodeAddress(address: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/geocode`, {
      params: { address }
    });
  }

  reverseGeocode(lat: number, lng: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reverse-geocode`, {
      params: { lat: lat.toString(), lng: lng.toString() }
    });
  }

  calculateRoute(from: { lat: number, lng: number }, to: { lat: number, lng: number }): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/route`, {
      params: {
        from_lat: from.lat.toString(),
        from_lng: from.lng.toString(),
        to_lat: to.lat.toString(),
        to_lng: to.lng.toString()
      }
    });
  }
}