import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { VideoCard } from '@/components/VideoCard';
import { videoService } from '@/services/videoService';
import { Video } from '@/types';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  
  const selectedCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const fetchedVideos = await videoService.getVideos(selectedCategory, searchQuery, 'long');
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [selectedCategory, searchQuery]);

  const categories = ['All', 'Music', 'Gaming', 'Live', 'News', 'Tech', 'Cooking', 'Travel', 'Education'];

  const handleCategoryClick = (cat: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-10">
      {/* Download Resolutions Section */}
      <section className="bg-secondary/50 rounded-xl p-4 relative overflow-hidden group cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold flex items-center gap-2">
            Download Videos in <span className="text-primary">114p to 4K</span>
          </h2>
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
            <span className="text-[10px]">›</span>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {[
            { res: '4K', img: 'https://picsum.photos/seed/4k/300/200' },
            { res: '1080p', img: 'https://picsum.photos/seed/1080/300/200' },
            { res: '720p', img: 'https://picsum.photos/seed/720/300/200' },
            { res: '480p', img: 'https://picsum.photos/seed/480/300/200' },
          ].map((item) => (
            <div key={item.res} className="relative flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden border border-border">
              <img src={item.img} alt={item.res} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold">{item.res}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex overflow-x-auto pb-2 -mx-2 px-2 no-scrollbar">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                selectedCategory === cat 
                  ? "bg-foreground text-background" 
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      ) : videos.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-lg font-bold">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Recommended for you'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-muted-foreground opacity-20" />
          </div>
          <h3 className="text-xl font-bold">No videos found</h3>
          <p className="text-muted-foreground max-w-xs">
            {searchQuery 
              ? `We couldn't find any videos matching "${searchQuery}". Try a different search term.`
              : selectedCategory !== 'All'
                ? `There are no videos in the "${selectedCategory}" category yet.`
                : "Be the first to upload a video to VidFlow!"}
          </p>
          {(searchQuery || selectedCategory !== 'All') ? (
            <Button 
              variant="outline" 
              className="rounded-full px-8"
              onClick={() => setSearchParams({})}
            >
              Clear Filters
            </Button>
          ) : (
            <Link to="/upload">
              <Button className="rounded-full px-8">Upload Now</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
