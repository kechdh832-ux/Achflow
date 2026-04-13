import React from 'react';
import { Video } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Share2, Flag, Bookmark } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface VideoCardProps {
  key?: string | number;
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareData = {
      title: video.title,
      text: `Check out this video on VidFlow: ${video.title}`,
      url: `${window.location.origin}/watch/${video.id}`,
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
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="group flex flex-col gap-3">
      <Link to={`/watch/${video.id}`} className="relative aspect-video rounded-xl overflow-hidden bg-muted">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
        )}
      </Link>

      <div className="flex gap-3">
        <Link to={`/profile/${video.authorId}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={video.authorPhoto} />
            <AvatarFallback>{video.authorName[0]}</AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video.id}`}>
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {video.title}
            </h3>
          </Link>
          <div className="mt-1 text-xs text-muted-foreground">
            <Link to={`/profile/${video.authorId}`} className="hover:text-foreground transition-colors">
              {video.authorName}
            </Link>
            <div className="flex items-center gap-1">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{formatDistanceToNow(video.createdAt)} ago</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
            )}
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" /> Share
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Bookmark className="h-4 w-4" /> Save
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive">
              <Flag className="h-4 w-4" /> Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
