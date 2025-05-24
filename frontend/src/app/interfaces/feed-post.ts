export interface FeedPost {
    id: string;
    userId: string;
    username: string;
    userProfileImage: string;
    imageUrl: string;
    caption: string;
    likes: number;
    comments: Comment[];
    timestamp: Date;
    saved: boolean;
    liked: boolean;
  }

  export interface Comment {
    id: string;
    userId: string;
    username: string;
    text: string;
    timestamp: Date;
  }