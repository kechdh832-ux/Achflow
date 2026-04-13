import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '@/AuthContext';
import { db } from '@/firebase';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { toast } from 'sonner';
import { User as AppUser } from '@/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser;
  onUpdate: (updatedUser: AppUser) => void;
}

export function EditProfileModal({ isOpen, onClose, user, onUpdate }: EditProfileModalProps) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user.name || '');
      setBio(user.bio || '');
      setPhotoURL(user.photoURL || '');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id);
      const updates: any = {
        name,
        bio: bio || ''
      };

      if (photoURL) {
        updates.photoURL = photoURL;
      } else {
        updates.photoURL = deleteField();
      }
      
      await updateDoc(userRef, updates);
      
      const updatedUser = { ...user, ...updates };
      if (!photoURL) delete updatedUser.photoURL;
      
      onUpdate(updatedUser);
      toast.success("Profile updated successfully!");
      onClose();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted group">
              <img 
                src={photoURL || `https://ui-avatars.com/api/?name=${name}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="w-full">
              <label className="text-sm font-medium mb-1 block">Profile Image URL</label>
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full h-10 bg-secondary border-none rounded-lg px-3 text-sm focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 bg-secondary border-none rounded-lg px-3 text-sm focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us about yourself..."
              className="w-full bg-secondary border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-full px-6">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
