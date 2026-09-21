import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UserIcon,
  LockIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  Loader2Icon,
  ShieldCheckIcon,
  CalendarIcon,
  CheckIcon,
  XIcon,
  InfoIcon,
} from "lucide-react";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileDialog({ open, onOpenChange }) {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("details");

  // Account details state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsSuccess, setDetailsSuccess] = useState("");

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (user && open) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setDetailsError("");
      setDetailsSuccess("");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      setPasswordSuccess("");
    }
  }, [user, open]);

  // Password policy live checks
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
  const isMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setDetailsLoading(true);
    setDetailsError("");
    setDetailsSuccess("");

    try {
      const { data } = await api.patch("/users/me/", {
        first_name: firstName,
        last_name: lastName,
        email: email,
      });
      updateUser(data);
      setDetailsSuccess("Profile details updated successfully.");
      setTimeout(() => setDetailsSuccess(""), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        Object.values(err.response?.data || {})
          .flat()
          .join(", ") ||
        "Failed to update profile.";
      setDetailsError(msg);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (!hasMinLength) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (!hasNumber) {
      setPasswordError("New password must contain at least one number (0-9).");
      return;
    }

    if (!hasSpecialChar) {
      setPasswordError(
        "New password must contain at least one special character (e.g. !@#$%^&*).",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post("/users/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPasswordSuccess("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.confirm_password?.[0] ||
        err.response?.data?.detail ||
        "Failed to change password.";
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="size-11 border-2 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                {getInitials(user?.display_name || user?.username)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <DialogTitle className="text-base font-bold text-foreground">
                {user?.display_name || user?.username}
              </DialogTitle>
              {user?.email ? (
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  {user.email}
                </DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 pt-3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger
                value="details"
                className="gap-1.5 text-xs font-medium"
              >
                <UserIcon className="size-3.5" />
                Account Details
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="gap-1.5 text-xs font-medium"
              >
                <LockIcon className="size-3.5" />
                Security
              </TabsTrigger>
            </TabsList>

            {/* --- Tab 1: Account Details --- */}
            <TabsContent value="details" className="pt-4 space-y-4">
              {detailsSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2Icon className="size-4 shrink-0" />
                  <span>{detailsSuccess}</span>
                </div>
              )}

              {detailsError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                  <AlertCircleIcon className="size-4 shrink-0" />
                  <span>{detailsError}</span>
                </div>
              )}

              {/* Read-only Metadata Card */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheckIcon className="size-3.5 text-primary" />
                    Account Role
                  </span>
                  <span className="font-semibold capitalize text-foreground">
                    {user?.role}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                    Member Since
                  </span>
                  <span className="font-medium text-foreground">
                    {formatDate(user?.date_joined)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Editable Fields Form */}
              <form onSubmit={handleUpdateDetails} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name" className="text-xs">
                      First Name
                    </Label>
                    <Input
                      id="first_name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Jane"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name" className="text-xs">
                      Last Name
                    </Label>
                    <Input
                      id="last_name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@ryantech.co.ke"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={detailsLoading}
                    className="gap-1.5 text-xs"
                  >
                    {detailsLoading && (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    )}
                    Save Details
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* --- Tab 2: Security (Change Password) --- */}
            <TabsContent value="security" className="pt-4 space-y-4">
              {passwordSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2Icon className="size-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                  <AlertCircleIcon className="size-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Password Policy Box */}
              <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <InfoIcon className="size-3.5 text-primary" />
                  Password Requirements
                </div>
                <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    {newPassword.length > 0 ? (
                      hasMinLength ? (
                        <CheckIcon className="size-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XIcon className="size-3.5 text-destructive shrink-0" />
                      )
                    ) : (
                      <span className="size-1.5 rounded-full bg-muted-foreground/60 shrink-0 mx-1" />
                    )}
                    <span
                      className={
                        newPassword.length > 0 && hasMinLength
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      At least 8 characters long
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {newPassword.length > 0 ? (
                      hasNumber ? (
                        <CheckIcon className="size-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XIcon className="size-3.5 text-destructive shrink-0" />
                      )
                    ) : (
                      <span className="size-1.5 rounded-full bg-muted-foreground/60 shrink-0 mx-1" />
                    )}
                    <span
                      className={
                        newPassword.length > 0 && hasNumber
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      Contains at least one number (0-9)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {newPassword.length > 0 ? (
                      hasSpecialChar ? (
                        <CheckIcon className="size-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <XIcon className="size-3.5 text-destructive shrink-0" />
                      )
                    ) : (
                      <span className="size-1.5 rounded-full bg-muted-foreground/60 shrink-0 mx-1" />
                    )}
                    <span
                      className={
                        newPassword.length > 0 && hasSpecialChar
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      Contains at least one special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="old_password" className="text-xs">
                    Current Password
                  </Label>
                  <Input
                    id="old_password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new_password" className="text-xs">
                    New Password
                  </Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters, number & symbol"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confirm_password" className="text-xs">
                      Confirm New Password
                    </Label>
                    {confirmPassword.length > 0 && (
                      <span
                        className={`text-[10px] font-medium ${isMatch ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
                      >
                        {isMatch ? "Passwords match" : "Does not match"}
                      </span>
                    )}
                  </div>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="h-9 text-xs"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={passwordLoading}
                    className="gap-1.5 text-xs"
                  >
                    {passwordLoading && (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
