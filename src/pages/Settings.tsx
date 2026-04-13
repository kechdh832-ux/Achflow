import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Moon, Globe, Shield, User, CreditCard, PlaySquare, MonitorPlay, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [activeTab, setActiveTab] = useState('account');

  const toggleDarkMode = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'playback', label: 'Playback and performance', icon: MonitorPlay },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'connected', label: 'Connected apps', icon: Globe },
    { id: 'billing', label: 'Billing and payments', icon: CreditCard },
    { id: 'advanced', label: 'Advanced settings', icon: SettingsIcon },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 pb-20">
      {/* Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <h1 className="text-2xl font-bold px-4 mb-6 hidden md:block">Settings</h1>
        <div className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0 px-2 md:px-0">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                "flex-shrink-0 md:w-full justify-start gap-4 h-12 font-medium rounded-xl",
                activeTab === tab.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-5 w-5 hidden md:block" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-3xl space-y-8 px-4 md:px-0">
        {activeTab === 'account' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-1">Account</h2>
              <p className="text-sm text-muted-foreground mb-6">Choose how you appear and what you see on VidFlow.</p>
              
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                  <CardTitle className="text-lg">Your channel</CardTitle>
                  <CardDescription>This is your public presence on VidFlow. You need a channel to upload your own videos, comment on videos, or create playlists.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden bg-muted">
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-full h-full p-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{user?.displayName || 'Your Channel'}</p>
                      <Button variant="link" className="px-0 h-auto text-primary">Channel status and features</Button>
                      <br/>
                      <Button variant="link" className="px-0 h-auto text-primary">Create a new channel</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="h-px bg-border" />

            <div>
              <h3 className="text-lg font-bold mb-4">Appearance</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark theme</Label>
                  <p className="text-sm text-muted-foreground">Dark theme turns the light surfaces of the page dark, creating an experience ideal for night.</p>
                </div>
                <Switch checked={isDark} onCheckedChange={toggleDarkMode} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-1">Notifications</h2>
              <p className="text-sm text-muted-foreground mb-6">Choose when and how to be notified.</p>
              
              <div className="space-y-6">
                <h3 className="text-lg font-bold">General</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Subscriptions</Label>
                    <p className="text-sm text-muted-foreground">Notify me about activity from the channels I'm subscribed to.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Recommended videos</Label>
                    <p className="text-sm text-muted-foreground">Notify me of videos I might like based on what I watch.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Activity on my channel</Label>
                    <p className="text-sm text-muted-foreground">Notify me about comments and other activity on my channel or videos.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'playback' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-1">Playback and performance</h2>
              <p className="text-sm text-muted-foreground mb-6">Control your video viewing experience.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Inline playback</Label>
                    <p className="text-sm text-muted-foreground">Play videos automatically as you hover over them on the Home screen.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Always show captions</Label>
                    <p className="text-sm text-muted-foreground">Show captions automatically when available.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-1">Privacy</h2>
              <p className="text-sm text-muted-foreground mb-6">Manage what you share on VidFlow.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Keep all my saved playlists private</Label>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Keep all my subscriptions private</Label>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fallback for other tabs */}
        {['connected', 'billing', 'advanced'].includes(activeTab) && (
          <div className="py-20 text-center">
            <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
            <p className="text-muted-foreground">These settings are currently under development.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
