export interface Post {
    id: string
    authorId: string
    authorUsername: string
    authorProfileImage?: string
    title: string
    text: string
    createdAt: Date
    imageUrl: string
    status: PostStatus
    tags: Tag[]
    likes: number
    comments: Comment[]
  }
  
  export enum PostStatus {
    JUST_POSTED = "just posted",
    FIRST_REACTIONS = "first reactions",
    OUTDATED = "outdated",
  }
  
  export interface Tag {
    id: string
    name: string
  }
  
  export interface Comment {
    id: string
    userId: string
    username: string
    text: string
    timestamp: Date
  }
  
  export interface PostFilter {
    tag?: string
    searchText?: string
    userId?: string
    onlyMine?: boolean
  }
  