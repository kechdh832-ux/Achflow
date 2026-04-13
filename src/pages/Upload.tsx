import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Film, Scissors, Type, Palette, Check, Loader2, AlertCircle, PlaySquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/AuthContext';
import { videoService } from '@/services/videoService';
import { moderateContent } from '@/services/geminiService';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function VideoUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'edit' | 'details'>('upload');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('All');
  const [videoType, setVideoType] = useState<'long' | 'short'>('long');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = ['All', 'Music', 'Gaming', 'Live', 'News', 'Tech', 'Cooking', 'Travel', 'Education'];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const videoFile = acceptedFiles[0];
    if (videoFile) {
      setFile(videoFile);
      setPreview(URL.createObjectURL(videoFile));
      setStep('edit');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi'] },
    multiple: false,
  } as any);

  const [activeTool, setActiveTool] = useState<'trim' | 'filters' | 'text' | 'music'>('trim');
  const [selectedFilter, setSelectedFilter] = useState('None');
  const [textOverlay, setTextOverlay] = useState('');

  const filters = ['None', 'Vibrant', 'Noir', 'Warm', 'Cool', 'Cinematic', 'Vintage'];
  const musicTracks = ['None', 'Upbeat Pop', 'Lo-fi Chill', 'Epic Cinematic', 'Happy Acoustic'];

  const handleUpload = async () => {
    if (!user) {
      toast.error('You must be signed in to upload videos.');
      return;
    }

    if (!title.trim()) {
      toast.error('Please add a title.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) return 95;
        return prev + 5;
      });
    }, 200);

    try {
      // 1. Moderate content
      const moderation = await moderateContent(title, description);
      if (!moderation.safe) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        toast.error(`Content rejected: ${moderation.reason}`, {
          duration: 5000,
          icon: <AlertCircle className="text-destructive" />
        });
        setIsUploading(false);
        return;
      }

      // Use a public sample video URL since we don't have a storage bucket in this prototype
      const publicVideoUrl = videoType === 'short' 
        ? 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
        : 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

      // 2. Upload to Firestore
      await videoService.uploadVideo({
        title,
        description,
        thumbnailUrl: videoType === 'short' 
          ? `https://picsum.photos/seed/${title.replace(/\s/g, '')}/450/800` 
          : `https://picsum.photos/seed/${title.replace(/\s/g, '')}/800/450`,
        videoUrl: publicVideoUrl,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhoto: user.photoURL || undefined,
        category,
        type: videoType,
        duration: 45,
        tags: []
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast.success('Video published successfully!', {
        description: 'Note: A sample video was used since this is a prototype without cloud storage.'
      });
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      console.error("Upload error:", error);
      toast.error('Failed to upload video.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
          <Upload className="h-10 w-10 text-muted-foreground opacity-20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Sign in to upload</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">
            Share your videos with the world by signing in to your VidFlow account.
          </p>
        </div>
        <Button onClick={() => navigate('/')} className="rounded-full px-8">
          Go to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Upload Video</h1>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${step === 'upload' ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`w-3 h-3 rounded-full ${step === 'edit' ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`w-3 h-3 rounded-full ${step === 'details' ? 'bg-primary' : 'bg-muted'}`} />
        </div>
      </div>

      {step === 'upload' && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer min-h-[400px] ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">Select video to upload</p>
            <p className="text-muted-foreground mt-1">Or drag and drop a file</p>
          </div>
          <Button className="mt-4 px-8 rounded-full">Select File</Button>
          <p className="text-xs text-muted-foreground mt-8">
            By submitting your videos to VidFlow, you acknowledge that you agree to our Terms of Service and Community Guidelines.
          </p>
        </div>
      )}

      {step === 'edit' && preview && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={cn(
              "bg-black rounded-2xl overflow-hidden shadow-2xl relative group transition-all duration-500",
              videoType === 'short' ? "aspect-[9/16] max-w-[300px] mx-auto" : "aspect-video"
            )}>
              <video 
                src={preview} 
                className={cn(
                  "w-full h-full object-contain transition-all duration-500",
                  selectedFilter === 'Vibrant' && "saturate-150 contrast-110",
                  selectedFilter === 'Noir' && "grayscale",
                  selectedFilter === 'Warm' && "sepia-[0.3] hue-rotate-[-10deg]",
                  selectedFilter === 'Cool' && "hue-rotate-[10deg] saturate-110",
                  selectedFilter === 'Cinematic' && "contrast-125 brightness-90",
                  selectedFilter === 'Vintage' && "sepia-[0.5] contrast-90"
                )} 
                controls 
              />
              
              {textOverlay && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-4xl font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] uppercase tracking-widest animate-pulse">
                    {textOverlay}
                  </span>
                </div>
              )}

              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant={activeTool === 'trim' ? 'default' : 'secondary'} 
                  className="rounded-full shadow-lg"
                  onClick={() => setActiveTool('trim')}
                >
                  <Scissors className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant={activeTool === 'text' ? 'default' : 'secondary'} 
                  className="rounded-full shadow-lg"
                  onClick={() => setActiveTool('text')}
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant={activeTool === 'filters' ? 'default' : 'secondary'} 
                  className="rounded-full shadow-lg"
                  onClick={() => setActiveTool('filters')}
                >
                  <Palette className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Card className="bg-secondary/30 border-none shadow-none">
              <CardContent className="p-6 space-y-6">
                {activeTool === 'trim' && (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="flex items-center gap-2"><Scissors className="h-4 w-4" /> Trim & Split</span>
                      <span className="text-muted-foreground">0:00 - 0:45</span>
                    </div>
                    <div className="h-16 bg-muted/50 rounded-lg relative overflow-hidden flex items-center px-2 gap-1">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="flex-1 h-8 bg-primary/20 rounded-sm" />
                      ))}
                      <div className="absolute inset-y-0 left-1/4 right-1/4 border-x-4 border-primary bg-primary/10" />
                    </div>
                    <Slider defaultValue={[25, 75]} max={100} step={1} className="py-4" />
                  </div>
                )}

                {activeTool === 'filters' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Palette className="h-4 w-4" /> Color Filters</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {filters.map(filter => (
                        <button
                          key={filter}
                          onClick={() => setSelectedFilter(filter)}
                          className={cn(
                            "flex-shrink-0 w-20 space-y-2 group",
                            selectedFilter === filter ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          <div className={cn(
                            "aspect-square rounded-lg border-2 transition-all overflow-hidden",
                            selectedFilter === filter ? "border-primary scale-105" : "border-transparent group-hover:border-muted-foreground/50"
                          )}>
                            <div className={cn(
                              "w-full h-full bg-gradient-to-br from-primary/20 to-primary/5",
                              filter === 'Noir' && "grayscale",
                              filter === 'Warm' && "sepia-[0.5]",
                              filter === 'Cool' && "hue-rotate-[30deg]"
                            )} />
                          </div>
                          <span className="text-[10px] font-bold block text-center truncate">{filter}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeTool === 'text' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2"><Type className="h-4 w-4" /> Text Overlays</h3>
                    <Input 
                      placeholder="Type something to add to video..." 
                      value={textOverlay}
                      onChange={(e) => setTextOverlay(e.target.value)}
                      className="bg-background border-muted"
                    />
                    <div className="flex gap-2">
                      {['Classic', 'Bold', 'Neon', 'Retro'].map(style => (
                        <Button key={style} variant="outline" size="sm" className="rounded-full text-[10px] h-7">
                          {style}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-secondary/30 border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Editor Tools</h3>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">PRO</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="ghost" 
                    className={cn("flex-col h-20 gap-2 text-[10px] font-bold", activeTool === 'trim' && "bg-primary/10 text-primary")}
                    onClick={() => setActiveTool('trim')}
                  >
                    <Scissors className="h-5 w-5" /> Trim
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={cn("flex-col h-20 gap-2 text-[10px] font-bold", activeTool === 'filters' && "bg-primary/10 text-primary")}
                    onClick={() => setActiveTool('filters')}
                  >
                    <Palette className="h-5 w-5" /> Filters
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={cn("flex-col h-20 gap-2 text-[10px] font-bold", activeTool === 'text' && "bg-primary/10 text-primary")}
                    onClick={() => setActiveTool('text')}
                  >
                    <Type className="h-5 w-5" /> Text
                  </Button>
                  <Button 
                    variant="ghost" 
                    className={cn("flex-col h-20 gap-2 text-[10px] font-bold", activeTool === 'music' && "bg-primary/10 text-primary")}
                    onClick={() => setActiveTool('music')}
                  >
                    <Film className="h-5 w-5" /> Music
                  </Button>
                </div>
                <Button className="w-full mt-4 h-12 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={() => setStep('details')}>
                  Next: Details
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Title (required)</label>
                <Input
                  placeholder="Add a title that describes your video"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Description</label>
                <Textarea
                  placeholder="Tell viewers about your video"
                  className="min-h-[150px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Video Type</label>
                <div className="flex gap-4">
                  <Button
                    variant={videoType === 'long' ? "default" : "outline"}
                    className="flex-1 rounded-xl h-12 gap-2"
                    onClick={() => setVideoType('long')}
                  >
                    <Film className="h-5 w-5" />
                    Long Video
                  </Button>
                  <Button
                    variant={videoType === 'short' ? "default" : "outline"}
                    className="flex-1 rounded-xl h-12 gap-2"
                    onClick={() => setVideoType('short')}
                  >
                    <PlaySquare className="h-5 w-5" />
                    Short Video
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground px-1">
                  {videoType === 'short' 
                    ? "Shorts are vertical videos up to 60 seconds long." 
                    : "Long videos are standard horizontal videos."}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={category === cat ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Thumbnail</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="aspect-video bg-muted rounded-lg border-2 border-primary flex items-center justify-center cursor-pointer">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div className="aspect-video bg-muted rounded-lg border-2 border-transparent hover:border-muted-foreground/50 transition-colors cursor-pointer" />
                  <div className="aspect-video bg-muted rounded-lg border-2 border-transparent hover:border-muted-foreground/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1">
                    <Upload className="h-4 w-4" />
                    <span className="text-[10px]">Upload</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="aspect-video bg-black">
                <video src={preview!} className="w-full h-full object-cover opacity-50" />
              </div>
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-muted-foreground">Video link</p>
                <p className="text-sm text-primary truncate">https://vidflow.app/v/xyz123</p>
                <p className="text-xs text-muted-foreground mt-4">Filename</p>
                <p className="text-sm truncate">{file?.name}</p>
              </CardContent>
            </Card>
            <Button 
              className="w-full h-12 text-lg font-bold relative overflow-hidden" 
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading && (
                <div 
                  className="absolute inset-0 bg-primary-foreground/20 transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
              <span className="relative z-10">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                    {uploadProgress < 100 ? `Uploading ${uploadProgress}%...` : 'Processing...'}
                  </>
                ) : (
                  'Publish'
                )}
              </span>
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep('edit')}>
              Back to Editor
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
