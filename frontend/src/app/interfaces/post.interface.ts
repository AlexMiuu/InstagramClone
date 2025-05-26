// Update the Post interface to match the backend structure
export interface Post {
  id: string
  authorId: string
  authorUsername: string
  authorProfileImage?: string
  title: string
  text: string
  createdAt: Date
  imageUrl: string
  status: string
  tags: Tag[]
  likes: number
  likerIds?: number
  comments: Comment[]
  
}

// We'll keep these enums as strings for easier handling
export const PostStatus = {
  JUST_POSTED: "just posted",
  FIRST_REACTIONS: "first reactions",
  OUTDATED: "outdated",
}

export interface Tag {
  id: string
  name: string
}

// Update the Comment interface to include score and postId
export interface Comment {
  id: string
  userId: string
  username: string
  text: string
  timestamp: Date
  score?: number
  postId?: string
}

export interface PostFilter {
  tag?: string
  searchText?: string
  userId?: string
  onlyMine?: boolean
}
