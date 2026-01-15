'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>User ID</Label>
            <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-foreground">
              {user?.id}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-foreground">
              {user?.email}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Name</Label>
            <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-foreground">
              {user?.name || 'Not provided'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;