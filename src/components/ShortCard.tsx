import React, { useRef, useEffect, useState } from 'react';
import { Video } from '@/types';
import { Heart, MessageCircle, Share2, MoreVertical, Music2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'motion/react';
import { downloadVideo } from '@/lib/download';

interface ShortCardProps {
  video: Video;
  isActive: boolean;
}

export function ShortCard({ video, isActive }: ShortCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden rounded-2xl">
      <video
        ref={videoRef}
        src={video.videoUrl}
        className="h-full w-full object-cover"
        loop
        muted={false}
        playsInline
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

      {/* Actions */}
      <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center z-10">
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={isLiked ? "text-red-500 bg-white/10" : "text-white bg-white/10"}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={isLiked ? "fill-current h-7 w-7" : "h-7 w-7"} />
          </Button>
          <span className="text-white text-xs font-medium">{video.likes.length + (isLiked ? 1 : 0)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Button variant="ghost" size="icon" className="text-white bg-white/10">
            <MessageCircle className="h-7 w-7" />
          </Button>
          <span className="text-white text-xs font-medium">{video.commentsCount}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Button variant="ghost" size="icon" className="text-white bg-white/10">
            <Share2 className="h-7 w-7" />
          </Button>
          <span className="text-white text-xs font-medium">Share</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Button variant="ghost" size="icon" className="text-white bg-white/10" onClick={() => downloadVideo(video.videoUrl, video.title)}>
            <Download className="h-7 w-7" />
          </Button>
          <span className="text-white text-xs font-medium">Save</span>
        </div>

        <Button variant="ghost" size="icon" className="text-white bg-white/10">
          <MoreVertical className="h-7 w-7" />
        </Button>

        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden animate-spin-slow">
          <Avatar className="h-full w-full">
            <AvatarImage src={video.authorPhoto} />
            <AvatarFallback>{video.authorName[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Info */}
      <div className="absolute left-4 bottom-6 right-20 z-10 text-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-lg">@{video.authorName.replace(/\s+/g, '').toLowerCase()}</span>
          <Button size="sm" className="h-7 bg-white text-black hover:bg-white/90 font-bold rounded-full px-4">
            Follow
          </Button>
        </div>
        <p className="text-sm line-clamp-2 mb-3">{video.description}</p>
        <div className="flex items-center gap-2 text-sm">
          <Music2 className="h-4 w-4 animate-pulse" />
          <span className="truncate">Original Sound - {video.authorName}</span>
        </div>
      </div>
    </div>
  );
}
