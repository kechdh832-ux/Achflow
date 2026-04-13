import { toast } from 'sonner';

export async function downloadVideo(url: string, filename: string) {
  try {
    toast.info("Starting download...", {
      description: `Preparing ${filename} for download.`
    });

    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(blobUrl);
    toast.success("Download complete!");
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback: open in new tab
    toast.error("Direct download failed due to browser security.", {
      description: "Opening video in a new tab. Right-click and select 'Save Video As...' to download.",
      action: {
        label: "Open Video",
        onClick: () => window.open(url, '_blank')
      }
    });
  }
}
