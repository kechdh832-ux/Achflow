import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoCard } from '@/components/VideoCard';
import { Edit2, Share2, Grid, Play, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { videoService } from '@/services/videoService';
import { User as AppUser, Video } from '@/types';
import { EditProfileModal } from '@/components/EditProfileModal';

export function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, appUser: currentAppUser, toggleSubscribe } = useAuth();
  const [profileUser, setProfileUser] = useState<AppUser | null>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const targetId = id || currentUser?.uid;
      
      if (!targetId) {
        setLoading(false);
        return;
      }
      
      if (!db) return;
      
      setLoading(true);
      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', targetId));
        if (userDoc.exists()) {
          setProfileUser(userDoc.data() as AppUser);
        }

        // Fetch user videos
        const videos = await videoService.getUserVideos(targetId);
        setUserVideos(videos);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    if (!id && !currentUser) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <h3 className="text-xl font-bold">Sign in required</h3>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
          <Button onClick={() => navigate('/')} variant="outline" className="rounded-full">
            Go Home
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h3 className="text-xl font-bold">User not found</h3>
        <p className="text-muted-foreground">The user you are looking for does not exist.</p>
        <Button onClick={() => navigate('/')} variant="outline" className="rounded-full">
          Go Home
        </Button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.uid === profileUser.id;
  const longVideos = userVideos.filter(v => v.type === 'long');
  const shortVideos = userVideos.filter(v => v.type === 'short');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Channel Banner */}
      <div className="w-full h-48 md:h-64 lg:h-80 bg-muted rounded-2xl overflow-hidden relative group">
        <img 
          src={`https://picsum.photos/seed/${profileUser.id}/1200/400`} 
          alt="Channel Banner" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="secondary" className="gap-2 rounded-full">
              <Edit2 className="h-4 w-4" /> Change Banner
            </Button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 px-4 md:px-8 relative z-10">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
          <AvatarImage src={profileUser.photoURL} />
          <AvatarFallback>{profileUser.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2 pb-2">
          <h1 className="text-3xl font-bold">{profileUser.name}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>@{profileUser.name.toLowerCase().replace(/\s+/g, '')}</span>
            <span>•</span>
            <span>{profileUser.followers?.length || 0} subscribers</span>
            <span>•</span>
            <span>{userVideos.length} videos</span>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed line-clamp-2">
            {profileUser.bio || 'Welcome to my channel! Subscribe for more content.'}
          </p>
        </div>

        <div className="flex gap-2 pb-2 w-full md:w-auto">
          {isOwnProfile ? (
            <div className="flex gap-2 w-full">
              <Button 
                variant="secondary" 
                className="gap-2 rounded-full flex-1 md:flex-none"
                onClick={() => setIsEditModalOpen(true)}
              >
                Customize channel
              </Button>
              <Button variant="secondary" className="gap-2 rounded-full flex-1 md:flex-none">
                Manage videos
              </Button>
            </div>
          ) : (
            <Button 
              variant={currentAppUser?.following.includes(profileUser.id) ? "secondary" : "default"} 
              className="gap-2 rounded-full w-full md:w-auto px-8"
              onClick={() => toggleSubscribe(profileUser.id)}
            >
              {currentAppUser?.following.includes(profileUser.id) ? "Subscribed" : "Subscribe"}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-12 gap-8 overflow-x-auto no-scrollbar">
            <TabsTrigger
              value="home"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold"
            >
              Home
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold"
            >
              Videos
            </TabsTrigger>
            <TabsTrigger
              value="shorts"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold"
            >
              Shorts
            </TabsTrigger>
            <TabsTrigger
              value="playlists"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold"
            >
              Playlists
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold"
            >
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="pt-6 space-y-8">
            {longVideos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Latest Videos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                  {longVideos.slice(0, 4).map(video => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              </div>
            )}
            {shortVideos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" /> Shorts
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {shortVideos.slice(0, 5).map(video => (
                    <div key={video.id} className="aspect-[9/16] rounded-xl overflow-hidden bg-muted relative group cursor-pointer">
                      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="text-white text-xs font-bold line-clamp-2">{video.title}</p>
                        <p className="text-white/80 text-[10px]">{video.views.toLocaleString()} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {userVideos.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                This channel has no content.
              </div>
            )}
          </TabsContent>

          <TabsContent value="videos" className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {longVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
              {longVideos.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  No videos uploaded yet.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="shorts" className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {shortVideos.map(video => (
                <div key={video.id} className="aspect-[9/16] rounded-xl overflow-hidden bg-muted relative group cursor-pointer">
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-white text-xs font-bold line-clamp-2">{video.title}</p>
                    <p className="text-white/80 text-[10px]">{video.views.toLocaleString()} views</p>
                  </div>
                </div>
              ))}
              {shortVideos.length === 0 && (
                <div className="col-span-full py-20 text-center text-muted-foreground">
                  No shorts uploaded yet.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="playlists" className="pt-6">
            <div className="py-20 text-center text-muted-foreground">
              No playlists created yet.
            </div>
          </TabsContent>

          <TabsContent value="about" className="pt-6">
            <div className="max-w-3xl space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {profileUser.bio || 'Welcome to my channel! Subscribe for more content.'}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Details</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</li>
                  <li>{userVideos.reduce((acc, v) => acc + v.views, 0).toLocaleString()} total views</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {profileUser && (
        <EditProfileModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          user={profileUser}
          onUpdate={(updatedUser) => setProfileUser(updatedUser)}
        />
      )}
    </div>
  );
}
