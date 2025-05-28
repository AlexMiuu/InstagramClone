import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { BehaviorSubject,  Observable, tap } from "rxjs"
import type { User } from "../interfaces/user"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:8080/auth"
  private tokenKey = "auth_token"
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    if (this.getToken()) {
      this.loadCurrentUser()
    }
  }

  login(email: string, password: string): Observable<string> {
    this.clearToken();
    return this.http.post<string>(`${this.apiUrl}/login`, { email, password }, { responseType: "text" as "json" }).pipe(
      tap((token) => {
        this.setToken(token)
        this.loadCurrentUser()
      }),
    )
  }

  register(user: User): Observable<string> {
    this.clearToken();
    return this.http.post<string>(`${this.apiUrl}/register`, user, { responseType: "text" as "json" })
  }

  logout(): void {
    this.clearToken();
    this.currentUserSubject.next(null);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
  }

  private loadCurrentUser(): void {
    this.http.get<User>("http://localhost:8080/users/me").subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.currentUserSubject.next(null),
    })
  }

  isLoggedIn(): boolean {
    return !!this.getToken()
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }
}
