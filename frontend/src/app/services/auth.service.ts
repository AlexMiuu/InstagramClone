// auth.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http"; // Import HttpParams
import { BehaviorSubject, Observable, of, tap, catchError } from "rxjs"; // Import of and catchError
import  { User } from "../interfaces/user"; // Assuming User interface has an 'id' property

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private authApiUrl = "http://localhost:8080/auth"; // For login/register
  private baseApiUrl = "http://localhost:8080"; 
    private baseApiUrl2 = "http://localhost:8080/users"; // For other user-related data like /users/me and /score
  private tokenKey = "auth_token";
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.getToken()) {
      this.loadCurrentUser();
    }
  }

  login(email: string, password: string): Observable<string> {
    this.clearToken();
    return this.http.post<string>(`${this.authApiUrl}/login`, { email, password }, { responseType: "text" as "json" }).pipe(
      tap((token) => {
        this.setToken(token);
        this.loadCurrentUser();
      }),
    );
  }

  register(user: User): Observable<string> {
    this.clearToken();
    return this.http.post<string>(`${this.authApiUrl}/register`, user, { responseType: "text" as "json" });
  }

  logout(): void {
    this.clearToken();
    this.currentUserSubject.next(null);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private loadCurrentUser(): void {
    // Assuming /users/me requires the token, which should be handled by an interceptor
    this.http.get<User>(`${this.baseApiUrl}/users/me`).subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => {
        this.currentUserSubject.next(null);
        // Potentially clear token if /me fails due to invalid token
        // this.clearToken();
      }
    });
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserFromApi(): Observable<User | null> {
    // Assuming /users/me requires the token, which should be handled by an interceptor
    return this.http.get<User>(`${this.baseApiUrl}/users/me`).pipe(
      tap({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.currentUserSubject.next(null),
      }),
      catchError(() => { // Ensure an observable is returned even on error
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  // New method to get the user score
  getUserScore(userId: string | number): Observable<number> {
    // Ensure userId is valid. The backend expects a Long, so a string representation of a number is fine for HttpParams.
    if (!userId || (typeof userId === 'string' && userId === "N/A")) {
      console.error('User ID is invalid for fetching score.');
      return of(0); // Return a default score or handle error as appropriate
    }
    const params = new HttpParams().set('id', userId.toString()); // Ensure id is a string for HttpParams
    // Assuming the score endpoint is at the root of your API, similar to /users/me
    return this.http.get<number>(`${this.baseApiUrl2}/score`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching user score:', error);
        // Depending on requirements, you might want to throw the error or return a default
        return of(0); // Default score on error
      })
    );
  }
}