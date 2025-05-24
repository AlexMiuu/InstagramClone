import { TestBed } from "@angular/core/testing"
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing"
import { AuthService, type User } from "./auth.service"
import { environment } from "../../environments/environment"

describe("AuthService", () => {
  let service: AuthService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    })
    service = TestBed.inject(AuthService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify() // Verify that no requests are outstanding
    localStorage.clear() // Clear localStorage after each test
  })

  it("should be created", () => {
    expect(service).toBeTruthy()
  })

  describe("login", () => {
    it("should authenticate user and store token", () => {
      // Arrange
      const mockEmail = "test@example.com"
      const mockPassword = "password123"
      const mockUser: User = {
        id: "user123",
        username: "testuser",
        email: mockEmail,
      }
      const mockResponse = {
        user: mockUser,
        token: "mock-jwt-token",
      }

      // Act
      let result: User | undefined
      service.login(mockEmail, mockPassword).subscribe((user) => {
        result = user
      })

      // Assert - Check that the request was made with the right data
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`)
      expect(req.request.method).toBe("POST")
      expect(req.request.body).toEqual({ email: mockEmail, password: mockPassword })

      // Respond with mock data
      req.flush(mockResponse)

      // Assert - Check that the result is as expected
      expect(result).toEqual(mockUser)
      expect(localStorage.getItem("token")).toBe("mock-jwt-token")
      expect(localStorage.getItem("currentUser")).toBe(JSON.stringify(mockUser))
    })
  })

  describe("register", () => {
    it("should register user and store token", () => {
      // Arrange
      const mockUserData = {
        email: "new@example.com",
        password: "password123",
        username: "newuser",
        fullName: "New User",
      }
      const mockUser: User = {
        id: "new-user-123",
        username: mockUserData.username,
        email: mockUserData.email,
      }
      const mockResponse = {
        user: mockUser,
        token: "new-user-token",
      }

      // Act
      let result: User | undefined
      service.register(mockUserData).subscribe((user) => {
        result = user
      })

      // Assert - Check that the request was made with the right data
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`)
      expect(req.request.method).toBe("POST")
      expect(req.request.body).toEqual(mockUserData)

      // Respond with mock data
      req.flush(mockResponse)

      // Assert - Check that the result is as expected
      expect(result).toEqual(mockUser)
      expect(localStorage.getItem("token")).toBe("new-user-token")
      expect(localStorage.getItem("currentUser")).toBe(JSON.stringify(mockUser))
    })
  })

  describe("logout", () => {
    it("should clear local storage and current user", () => {
      // Arrange - Set up localStorage with user data
      const mockUser = { id: "user1", username: "testuser", email: "test@example.com" }
      localStorage.setItem("token", "test-token")
      localStorage.setItem("currentUser", JSON.stringify(mockUser))

      // Act
      service.logout()

      // Assert
      expect(localStorage.getItem("token")).toBeNull()
      expect(localStorage.getItem("currentUser")).toBeNull()

      // Check that currentUser$ emits null
      service.currentUser$.subscribe((user) => {
        expect(user).toBeNull()
      })
    })
  })

  describe("isAuthenticated", () => {
    it("should return true when user is logged in", () => {
      // Arrange - Set up a logged in user
      const mockUser: User = { id: "user123", username: "testuser", email: "test@example.com" }
      ;(service as any).currentUserSubject.next(mockUser)

      // Act & Assert
      expect(service.isAuthenticated()).toBeTrue()
    })

    it("should return false when no user is logged in", () => {
      // Arrange - Ensure no user is logged in
      ;(service as any).currentUserSubject.next(null)

      // Act & Assert
      expect(service.isAuthenticated()).toBeFalse()
    })
  })
})
