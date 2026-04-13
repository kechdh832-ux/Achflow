import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, MessageSquare, Loader2 } from 'lucide-react';
import { VideoCard } from '@/components/VideoCard';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { videoService } from '@/services/videoService';
import { Video } from '@/types';
import { downloadVideo } from '@/lib/download';
import { useAuth } from '@/AuthContext';

export function Watch() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const { appUser, toggleSubscribe } = useAuth();

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const allVideos = await videoService.getVideos();
        const foundVideo = allVideos.find(v => v.id === id);
        if (foundVideo) {
          setVideo(foundVideo);
          setRelatedVideos(allVideos.filter(v => v.id !== id));
          // Increment views
          videoService.incrementViews(id);
        }
      } catch (error) {
        console.error("Error fetching video:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideoData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading video...</p>
      </div>
    );
  }

  if (!video) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold">Video not found</h2>
      <Link to="/" className="text-primary hover:underline mt-4 inline-block">Go back home</Link>
    </div>
  );

  const handleShare = async () => {
    const shareData = {
      title: video.title,
      text: `Check out this video on VidFlow: ${video.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDownload = () => {
    downloadVideo(video.videoUrl, video.title);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 md:pb-0">
      <div className="lg:col-span-2 space-y-4">
        {/* Video Player */}
        <div className="aspect-video bg-black md:rounded-xl overflow-hidden shadow-lg -mx-4 md:mx-0">
          <video
            src={video.videoUrl}
            className="w-full h-full"
            controls
            autoPlay
            playsInline
          />
        </div>

        {/* Info */}
        <div className="space-y-4 px-4 md:px-0">
          <h1 className="text-xl font-bold line-clamp-2">{video.title}</h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <Link to={`/profile/${video.authorId}`} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={video.authorPhoto} />
                  <AvatarFallback>{video.authorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm">{video.authorName}</p>
                  <p className="text-xs text-muted-foreground">1.2M subscribers</p>
                </div>
              </Link>
              {appUser?.id !== video.authorId && (
                <Button 
                  className="rounded-full px-6 font-bold"
                  variant={appUser?.following.includes(video.authorId) ? "secondary" : "default"}
                  onClick={() => toggleSubscribe(video.authorId)}
                >
                  {appUser?.following.includes(video.authorId) ? "Subscribed" : "Subscribe"}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full overflow-x-auto no-scrollbar max-w-full">
              <div className="flex items-center border-r pr-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className={isLiked ? "rounded-l-full gap-2 text-primary" : "rounded-l-full gap-2"}
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <ThumbsUp className={isLiked ? "fill-current h-5 w-5" : "h-5 w-5"} />
                  <span className="text-sm font-bold">{video.likes.length + (isLiked ? 1 : 0)}</span>
                </Button>
                <Button variant="ghost" size="sm" className="rounded-none px-3">
                  <ThumbsDown className="h-5 w-5" />
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full gap-2 flex-shrink-0" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
                <span className="text-sm font-bold hidden sm:inline">Share</span>
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full gap-2 flex-shrink-0" onClick={handleDownload}>
                <Download className="h-5 w-5" />
                <span className="text-sm font-bold hidden sm:inline">Download</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-muted/50 rounded-xl p-3 text-sm">
            <div className="flex gap-2 font-bold mb-1">
              <span>{video.views.toLocaleString()} views</span>
              <span>{formatDistanceToNow(video.createdAt)} ago</span>
            </div>
            <p className="whitespace-pre-wrap">{video.description}</p>
            <div className="flex gap-2 mt-2 text-primary font-medium">
              {video.tags.map(tag => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </div>

          {/* Comments Placeholder */}
          <div className="space-y-4 pt-4 pb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold">{video.commentsCount} Comments</h2>
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Sort by
              </Button>
            </div>
            <div className="flex gap-3 sm:gap-4">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                <AvatarImage src={appUser?.photoURL || "https://picsum.photos/seed/me/200/200"} />
                <AvatarFallback>{appUser?.name?.[0] || 'ME'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <input
                  placeholder="Add a comment..."
                  className="w-full bg-transparent border-b border-muted-foreground/30 focus:border-primary outline-none py-1 transition-colors text-sm sm:text-base"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">Cancel</Button>
                  <Button size="sm" disabled>Comment</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Related Videos */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg px-2 lg:px-0">Up Next</h2>
        <div className="flex flex-col gap-4 px-2 lg:px-0">
          {relatedVideos.map(v => (
            <div key={v.id} className="flex gap-3 group">
              <Link to={`/watch/${v.id}`} className="relative w-32 sm:w-40 aspect-video rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </Link>
              <div className="flex-1 min-w-0 py-1">
                <Link to={`/watch/${v.id}`}>
                  <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight">{v.title}</h3>
                </Link>
                <div className="text-xs text-muted-foreground mt-1.5 space-y-0.5">
                  <p className="hover:text-foreground transition-colors line-clamp-1">{v.authorName}</p>
                  <p>{v.views.toLocaleString()} views • {formatDistanceToNow(v.createdAt)} ago</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
