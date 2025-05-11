import { Injectable } from "@angular/core"
import  { HttpClient } from "@angular/common/http"
import { BehaviorSubject,  Observable } from "rxjs"
import { map, tap } from "rxjs/operators"
import { environment } from "../../environments/environment"

export interface User {
  id: string
  username: string
  email: string
  profileImage?: string
}

export interface AuthResponse {
  user: User
  token: string
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = environment.apiUrl
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  constructor(private http: HttpClient) {
    this.loadUserFromStorage()
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem("currentUser")
    if (userJson) {
      try {
        const user = JSON.parse(userJson)
        this.currentUserSubject.next(user)
      } catch (error) {
        console.error("Error parsing user from localStorage", error)
        localStorage.removeItem("currentUser")
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        localStorage.setItem("token", response.token)
        localStorage.setItem("currentUser", JSON.stringify(response.user))
        this.currentUserSubject.next(response.user)
      }),
      map((response) => response.user),
    )
  }

  register(userData: { email: string; password: string; username: string; fullName: string }): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData).pipe(
      tap((response) => {
        localStorage.setItem("token", response.token)
        localStorage.setItem("currentUser", JSON.stringify(response.user))
        this.currentUserSubject.next(response.user)
      }),
      map((response) => response.user),
    )
  }

  logout(): void {
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    this.currentUserSubject.next(null)
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUser$
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value
  }

  getToken(): string | null {
    return localStorage.getItem("token")
  }
}
