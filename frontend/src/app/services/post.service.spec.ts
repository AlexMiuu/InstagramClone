import { TestBed } from "@angular/core/testing"
import { PostService } from "./post.service"
import { PostStatus } from "../interfaces/post.interface"

describe("PostService", () => {
  let service: PostService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(PostService)
  })

  it("should be created", () => {
    expect(service).toBeTruthy()
  })

  describe("getPosts", () => {
    it("should return an observable of posts", (done) => {
      service.getPosts().subscribe((posts) => {
        expect(posts).toBeDefined()
        expect(Array.isArray(posts)).toBeTrue()
        done()
      })
    })
  })

  describe("createPost", () => {
    it("should create a new post with provided data", (done) => {
      // Arrange
      const postData = {
        title: "Test Post",
        text: "This is a test post",
        imageUrl: "https://example.com/image.jpg",
      }
      const tags = [
        { id: "1", name: "test" },
        { id: "2", name: "example" },
      ]

      // Act
      service.createPost(postData, tags).subscribe((newPost) => {
        // Assert
        expect(newPost).toBeDefined()
        expect(newPost.title).toBe(postData.title)
        expect(newPost.text).toBe(postData.text)
        expect(newPost.imageUrl).toBe(postData.imageUrl)
        expect(newPost.tags).toEqual(tags)
        expect(newPost.status).toBe(PostStatus.JUST_POSTED)
        expect(newPost.authorId).toBe(service.getCurrentUserId())

        // Verify it was added to the posts list
        service.getPostById(newPost.id).subscribe((foundPost) => {
          expect(foundPost).toBeDefined()
          expect(foundPost!.id).toBe(newPost.id)
          done()
        })
      })
    })
  })

  describe("likePost", () => {
    it("should increment the like count for a post", (done) => {
      // First create a post
      const postData = {
        title: "Like Test Post",
        text: "Testing likes",
      }

      service.createPost(postData, []).subscribe((newPost) => {
        const initialLikes = newPost.likes

        // Act - Like the post
        service.likePost(newPost.id).subscribe((updatedPost) => {
          // Assert
          expect(updatedPost).toBeDefined()
          if (updatedPost) {
            expect(updatedPost.likes).not.toBe(initialLikes)
          }
          done()
        })
      })
    })
  })

  describe("addComment", () => {
    it("should add a comment to a post", (done) => {
      // First create a post
      const postData = {
        title: "Comment Test Post",
        text: "Testing comments",
      }

      service.createPost(postData, []).subscribe((newPost) => {
        const initialCommentCount = newPost.comments.length
        const commentText = "This is a test comment"

        // Act - Add a comment
        service.addComment(newPost.id, commentText).subscribe((updatedPost) => {
          // Assert
          expect(updatedPost).toBeDefined()
          if (updatedPost) {
            expect(updatedPost.comments.length).toBe(initialCommentCount + 1)
            expect(updatedPost.comments[0].text).toBe(commentText)
            expect(updatedPost.comments[0].userId).toBe(service.getCurrentUserId())
          }
          done()
        })
      })
    })
  })

  describe("getFilteredPosts", () => {
    it("should filter posts by search text", (done) => {
      // Create some posts with different titles
      const promises: Promise<any>[] = []

      promises.push(
        new Promise<void>((resolve) => {
          service.createPost({ title: "Apple Pie Recipe", text: "Delicious pie" }, []).subscribe(() => resolve())
        }),
      )

      promises.push(
        new Promise<void>((resolve) => {
          service.createPost({ title: "Banana Bread", text: "Easy to make" }, []).subscribe(() => resolve())
        }),
      )

      promises.push(
        new Promise<void>((resolve) => {
          service.createPost({ title: "Apple iPhone Review", text: "New features" }, []).subscribe(() => resolve())
        }),
      )

      // Wait for all posts to be created
      Promise.all(promises).then(() => {
        // Act - Filter by "Apple"
        service.getFilteredPosts({ searchText: "Apple" }).subscribe((filteredPosts) => {
          // Assert
          expect(filteredPosts.length).toBeGreaterThanOrEqual(2)
          expect(filteredPosts.some((p) => p.title.includes("Apple"))).toBeTrue()
          expect(filteredPosts.every((p) => p.title.includes("Apple"))).toBeTrue()
          done()
        })
      })
    })
  })
})
