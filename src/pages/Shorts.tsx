import React, { useState, useRef, useEffect } from 'react';
import { ShortCard } from '@/components/ShortCard';
import { videoService } from '@/services/videoService';
import { Video } from '@/types';
import { Loader2 } from 'lucide-react';

export function Shorts() {
  const [shorts, setShorts] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchShorts = async () => {
      setLoading(true);
      try {
        const shortVideos = await videoService.getVideos(undefined, undefined, 'short');
        setShorts(shortVideos);
      } catch (error) {
        console.error("Error fetching shorts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShorts();
  }, []);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollPos = containerRef.current.scrollTop;
      const height = containerRef.current.clientHeight;
      const index = Math.round(scrollPos / height);
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading shorts...</p>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <p className="text-muted-foreground">No shorts found.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center h-[calc(100vh-104px-80px)] lg:h-[calc(100vh-104px)]">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full max-w-[450px] h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar lg:rounded-2xl shadow-2xl bg-black"
      >
        {shorts.map((video, index) => (
          <div key={video.id} className="h-full w-full snap-start snap-always">
            <ShortCard video={video} isActive={index === activeIndex} />
          </div>
        ))}
      </div>
    </div>
  );
}
