import React, { useState, useEffect } from 'react';
import { videoService } from '@/services/videoService';
import { Video } from '@/types';
import { VideoCard } from '@/components/VideoCard';
import { Download, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Downloads() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const fetchedVideos = await videoService.getVideos();
        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching videos for downloads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Download className="h-6 w-6 text-primary" />
            Download Center
          </h1>
          <p className="text-muted-foreground text-sm">Find and save your favorite videos for offline viewing.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search videos to download..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      ) : filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {filteredVideos.map((video) => (
            <div key={video.id} className="relative group">
              <VideoCard video={video} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="sm" 
                  className="rounded-full shadow-lg gap-2"
                  onClick={() => {
                    // This would call the download utility we created earlier
                    import('@/lib/download').then(m => m.downloadVideo(video.videoUrl, video.title));
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
          <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-bold">No videos found</h3>
          <p className="text-muted-foreground">Try searching for something else or browse the home page.</p>
        </div>
      )}
    </div>
  );
}
