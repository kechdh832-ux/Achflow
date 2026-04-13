import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '../firebase';
import { Video } from '../types';

const VIDEOS_COLLECTION = 'videos';

export const videoService = {
  async uploadVideo(videoData: Omit<Video, 'id' | 'views' | 'likes' | 'createdAt' | 'commentsCount'>) {
    if (!db) throw new Error('Firestore not initialized');
    
    const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), {
      ...videoData,
      views: 0,
      likes: [],
      commentsCount: 0,
      createdAt: Date.now(),
    });
    
    return docRef.id;
  },

  async getVideos(category?: string, searchQuery?: string, type?: 'long' | 'short') {
    if (!db) return [];
    
    let q = query(collection(db, VIDEOS_COLLECTION), orderBy('createdAt', 'desc'));
    
    if (category && category !== 'All') {
      q = query(q, where('category', '==', category));
    }

    if (type) {
      q = query(q, where('type', '==', type));
    }
    
    const querySnapshot = await getDocs(q);
    let videos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Video[];

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      videos = videos.filter(v => 
        v.title.toLowerCase().includes(lowerQuery) || 
        v.description.toLowerCase().includes(lowerQuery) ||
        v.tags?.some(t => t.toLowerCase().includes(lowerQuery))
      );
    }
    
    return videos;
  },

  async incrementViews(videoId: string) {
    if (!db) return;
    const videoRef = doc(db, VIDEOS_COLLECTION, videoId);
    await updateDoc(videoRef, {
      views: increment(1)
    });
  },

  async toggleLike(videoId: string, userId: string, isLiked: boolean) {
    if (!db) return;
    const videoRef = doc(db, VIDEOS_COLLECTION, videoId);
    await updateDoc(videoRef, {
      likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
  },

  async getUserVideos(userId: string) {
    if (!db) return [];
    const q = query(
      collection(db, VIDEOS_COLLECTION),
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Video[];
  }
};
