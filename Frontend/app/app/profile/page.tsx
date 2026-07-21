"use client";

// Profile & Settings Page
import React, { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { updateProfile, type User } from "@/lib/api/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, User as UserIcon, Bell, Shield, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [confidenceThreshold, setConfidenceThreshold] = useState(user?.confidenceThreshold || 85);
  const [notificationPrefs, setNotificationPrefs] = useState(
    user?.notificationPrefs || { email: true, inApp: true, approvalAlerts: true, processingAlerts: true }
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateProfile({
        name,
        confidenceThreshold,
        preferences: notificationPrefs,
      });
      updateUser(updated);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Profile & Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Information */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-semibold">Profile Information</CardTitle>
          </div>
          <CardDescription className="text-xs">Update your display name and account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              {name.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
              <p className="text-xs text-muted-foreground capitalize">Role: {user?.role || "submitter"}</p>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Display Name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} disabled className="bg-muted" />
              <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-semibold">Notification Preferences</CardTitle>
          </div>
          <CardDescription className="text-xs">Choose how you want to be notified about workflow events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={notificationPrefs.email}
              onCheckedChange={(checked) => setNotificationPrefs((p) => ({ ...p, email: checked }))}
              aria-label="Email notifications"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">In-App Notifications</p>
              <p className="text-xs text-muted-foreground">Show notifications in the console</p>
            </div>
            <Switch
              checked={notificationPrefs.inApp}
              onCheckedChange={(checked) => setNotificationPrefs((p) => ({ ...p, inApp: checked }))}
              aria-label="In-app notifications"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Approval Alerts</p>
              <p className="text-xs text-muted-foreground">Get notified when items need your approval</p>
            </div>
            <Switch
              checked={notificationPrefs.approvalAlerts}
              onCheckedChange={(checked) => setNotificationPrefs((p) => ({ ...p, approvalAlerts: checked }))}
              aria-label="Approval alerts"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Processing Alerts</p>
              <p className="text-xs text-muted-foreground">Get notified when AI processing completes</p>
            </div>
            <Switch
              checked={notificationPrefs.processingAlerts}
              onCheckedChange={(checked) => setNotificationPrefs((p) => ({ ...p, processingAlerts: checked }))}
              aria-label="Processing alerts"
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-Accept Confidence Threshold */}
      <Card className="border border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-semibold">Confidence Threshold</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Set the minimum AI confidence score for auto-accepting workflow results. Documents below this threshold will be flagged for manual review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Auto-Accept Threshold</Label>
              <span className="text-lg font-bold text-primary">{confidenceThreshold}%</span>
            </div>
            <Slider
              value={[confidenceThreshold]}
              onValueChange={([val]) => setConfidenceThreshold(val)}
              min={50}
              max={99}
              step={1}
              aria-label="Confidence threshold"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50% (More auto-approvals)</span>
              <span>99% (Stricter review)</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">
              {confidenceThreshold >= 90
                ? "Strict: Only very high-confidence results will be auto-accepted. Most documents will require manual review."
                : confidenceThreshold >= 80
                ? "Balanced: Moderate confidence results will be auto-accepted. Low confidence documents will require review."
                : "Permissive: More documents will be auto-accepted. Only very low confidence results will require review."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
