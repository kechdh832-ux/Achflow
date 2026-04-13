export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  bio?: string;
  followers: string[];
  following: string[];
  createdAt: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  views: number;
  likes: string[]; // Array of user IDs
  commentsCount: number;
  category: string;
  type: 'long' | 'short';
  tags: string[];
  createdAt: number;
  duration?: number;
}

export interface Comment {
  id: string;
  videoId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  createdAt: number;
}
