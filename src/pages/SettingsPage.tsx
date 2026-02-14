import React from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";

import { userApi } from "../api/userApi";
import type { User } from "../types";
import { useAppDispatch } from "../hooks/useRedux";
import { setCurrentUser } from "../features/session/store/sessionSlice";

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profileDraft, setProfileDraft] = React.useState({
    name: "",
    email: "",
  });
  const [preferencesDraft, setPreferencesDraft] = React.useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    twoFactorEnabled: false,
  });
  const [sessions, setSessions] = React.useState<
    Array<{
      id: string;
      userId: string;
      label: string;
      createdAt: string;
      current: boolean;
    }>
  >([]);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [preferencesSaving, setPreferencesSaving] = React.useState(false);
  const [passwordSaving, setPasswordSaving] = React.useState(false);
  const [sessionSaving, setSessionSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await userApi.getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        setProfileDraft({
          name: currentUser.name,
          email: currentUser.email || "",
        });
        setPreferencesDraft({
          emailNotifications:
            currentUser.preferences?.emailNotifications ?? true,
          pushNotifications: currentUser.preferences?.pushNotifications ?? true,
          weeklyDigest: currentUser.preferences?.weeklyDigest ?? true,
          twoFactorEnabled: currentUser.preferences?.twoFactorEnabled ?? false,
        });
      }
      const activeSessions = await userApi.getActiveSessions();
      setSessions(activeSessions);
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setError("");
    setMessage("");
    setProfileSaving(true);
    try {
      const updatedUser = {
        ...user,
        name: profileDraft.name.trim(),
        email: profileDraft.email.trim(),
      };
      const saved = await userApi.updateProfile(updatedUser);
      setUser(saved);
      dispatch(setCurrentUser(saved));
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setError("");
    setMessage("");
    setPreferencesSaving(true);
    try {
      const saved = await userApi.updatePreferences(preferencesDraft);
      setUser(saved);
      dispatch(setCurrentUser(saved));
      setMessage("Notification and security preferences saved.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save preferences",
      );
    } finally {
      setPreferencesSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    setError("");
    setMessage("");
    setPasswordSaving(true);
    try {
      await userApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password changed successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSignOutOtherSessions = async () => {
    setSessionSaving(true);
    setError("");
    setMessage("");
    try {
      await userApi.signOutOtherSessions();
      const activeSessions = await userApi.getActiveSessions();
      setSessions(activeSessions);
      setMessage("Signed out from other sessions.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update sessions",
      );
    } finally {
      setSessionSaving(false);
    }
  };

  const handleLogout = async () => {
    await userApi.logout();
    dispatch(setCurrentUser(null));
    navigate("/login");
  };

  if (loading)
    return (
      <div className="p-12 text-center text-slate-500">Loading settings...</div>
    );

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-12">
      <header className="max-w-4xl mx-auto mb-12">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
          Settings
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 uppercase tracking-widest">
          Manage your account and preferences
        </p>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        {(message || error) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-bold ${error ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300" : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300"}`}
          >
            {error || message}
          </div>
        )}

        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Icons.User size={24} className="text-primary" />
              Profile Settings
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                value={profileDraft.name}
                onChange={(e) =>
                  setProfileDraft((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={profileDraft.email}
                onChange={(e) =>
                  setProfileDraft((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                Role
              </label>
              <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold">
                {user?.role}
              </div>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Icons.Bell size={24} className="text-primary" />
              Notification Preferences
            </h2>
          </div>
          <div className="p-8 space-y-4">
            {[
              {
                key: "emailNotifications",
                label: "Email notifications",
                desc: "Receive email updates for new documents",
              },
              {
                key: "pushNotifications",
                label: "Push notifications",
                desc: "Browser notifications for mentions and comments",
              },
              {
                key: "weeklyDigest",
                label: "Weekly digest",
                desc: "Summary of activity every Monday",
              },
              {
                key: "twoFactorEnabled",
                label: "Two-factor authentication",
                desc: "Require extra verification during sign-in",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {item.label}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {item.desc}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(
                      preferencesDraft[
                        item.key as keyof typeof preferencesDraft
                      ],
                    )}
                    onChange={(e) =>
                      setPreferencesDraft((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
            <button
              onClick={handleSavePreferences}
              disabled={preferencesSaving}
              className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {preferencesSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Icons.Shield size={24} className="text-primary" />
              Security
            </h2>
          </div>
          <div className="p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:text-white"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={passwordSaving}
              className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {passwordSaving ? "Updating..." : "Change Password"}
            </button>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-slate-900 dark:text-white">
                  Active Sessions
                </p>
                <button
                  onClick={handleSignOutOtherSessions}
                  disabled={sessionSaving}
                  className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 disabled:opacity-60"
                >
                  {sessionSaving ? "Updating..." : "Sign Out Others"}
                </button>
              </div>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {session.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(session.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {session.current && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-300 font-bold rounded-xl transition-all text-left"
            >
              Sign Out
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
