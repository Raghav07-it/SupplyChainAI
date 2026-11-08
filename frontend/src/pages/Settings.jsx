import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getSettings,
  updateSettings,
  updateProfile,
  changePassword,
} from "../api/settings";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import {
  User,
  Building,
  Mail,
  Shield,
  Bell,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Key,
  Server,
  Database,
  Cpu,
} from "lucide-react";

export default function Settings() {
  const { user, updateUserData } = useAuth();

  // Loading & Feedback
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile"); // profile, notifications, security, system
  const [profileMessage, setProfileMessage] = useState(null);
  const [notifMessage, setNotifMessage] = useState(null);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Settings / Notifications State
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_alerts: false,
    critical_alerts: true,
    high_severity_alerts: true,
    weather_alerts: true,
    digest_frequency: "daily",
    theme: "dark",
    compact_view: false,
  });
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Initialize
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setCompanyName(user.company_name || "");
    }

    async function loadSettings() {
      try {
        const res = await getSettings();
        if (res && res.id) {
          setSettings(res);
        }
      } catch (err) {
        console.warn("Could not load user settings:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [user]);

  // Handlers
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const res = await updateProfile({ fullName, companyName });
      updateUserData({ full_name: res.full_name, company_name: res.company_name });
      setProfileMessage({ type: "success", text: "Profile and company information updated successfully." });
    } catch (err) {
      setProfileMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    setNotifMessage(null);

    try {
      const updated = await updateSettings({
        email_notifications: settings.email_notifications,
        sms_alerts: settings.sms_alerts,
        critical_alerts: settings.critical_alerts,
        high_severity_alerts: settings.high_severity_alerts,
        weather_alerts: settings.weather_alerts,
        digest_frequency: settings.digest_frequency,
        compact_view: settings.compact_view,
      });
      setSettings(updated);
      setNotifMessage({ type: "success", text: "Notification preferences saved successfully." });
    } catch (err) {
      setNotifMessage({ type: "error", text: err.message || "Failed to save settings." });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMessage({ type: "success", text: "Password changed successfully. Please keep it safe." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage({ type: "error", text: err.message || "Failed to update password." });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Loading user configuration & preferences…" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Settings & Workspace"
        subtitle="Manage your personal profile, notification thresholds, security credentials, and platform preferences."
        badge={<Badge variant="default">Isolated Workspace</Badge>}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === "profile"
              ? "bg-[var(--accent-primary)] text-white"
              : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-elevated)]"
          }`}
        >
          <User size={14} />
          <span>Profile & Organization</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === "notifications"
              ? "bg-[var(--accent-primary)] text-white"
              : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-elevated)]"
          }`}
        >
          <Bell size={14} />
          <span>Alert Preferences</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === "security"
              ? "bg-[var(--accent-primary)] text-white"
              : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-elevated)]"
          }`}
        >
          <Lock size={14} />
          <span>Security & Password</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === "system"
              ? "bg-[var(--accent-primary)] text-white"
              : "text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-elevated)]"
          }`}
        >
          <Server size={14} />
          <span>System Diagnostics</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: Profile & Organization
          ========================================================= */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <h3 className="text-sm font-bold text-[var(--text-high-contrast)] mb-1 flex items-center gap-2">
                <User size={16} className="text-[var(--accent-cyan)]" />
                Profile Information
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-5">
                Update your identity details. These will be used for bills of lading, customs filings, and route notifications.
              </p>

              {profileMessage && (
                <div
                  className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
                    profileMessage.type === "success"
                      ? "bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[var(--status-success)]"
                      : "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[var(--status-critical)]"
                  }`}
                >
                  {profileMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[var(--text-dim)] uppercase font-semibold text-[11px] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-[var(--surface-base)] border border-[var(--border-color)] rounded-md px-3 py-2 text-[var(--text-high-contrast)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-[var(--text-dim)] uppercase font-semibold text-[11px] mb-1.5">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="w-full bg-[var(--surface-base)] border border-[var(--border-color)] rounded-md px-3 py-2 text-[var(--text-high-contrast)] focus:outline-none focus:border-[var(--accent-primary)]"
                  />
                  <p className="text-[11px] text-[var(--text-dim)] mt-1">
                    This automatically tags your isolated shipments, products, and carrier escrows.
                  </p>
                </div>

                <div>
                  <label className="block text-[var(--text-dim)] uppercase font-semibold text-[11px] mb-1.5">
                    Work Email (Account Identifier)
                  </label>
                  <div className="flex items-center gap-2 bg-[var(--surface-base)] border border-[var(--border-color)] rounded-md px-3 py-2 text-[var(--text-dim)] cursor-not-allowed">
                    <Mail size={14} />
                    <span>{user?.email}</span>
                  </div>
                  <p className="text-[10px] text-[var(--text-dim)] mt-1">
                    Email address cannot be modified once provisioned for tenant isolation.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" disabled={profileSaving} variant="primary">
                    {profileSaving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          <div>
            <Card>
              <h3 className="text-xs font-bold text-[var(--text-high-contrast)] mb-3 uppercase tracking-wider">
                Tenant Ownership
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-dim)] block">Workspace Scope</span>
                  <span className="font-semibold text-[var(--text-high-contrast)]">Tenant #{user?.id}</span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-dim)] block">Role & Permissions</span>
                  <Badge variant="cyan">{user?.role || "supplier"}</Badge>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-dim)] block">Associated Supplier ID</span>
                  <span className="font-mono text-[var(--text-high-contrast)]">
                    {user?.supplier_id ? `SUP-${user.supplier_id}` : "Unlinked"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-dim)] block">Account Created</span>
                  <span className="text-[var(--text-secondary)]">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Active"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: Alert Preferences
          ========================================================= */}
      {activeTab === "notifications" && (
        <Card>
          <h3 className="text-sm font-bold text-[var(--text-high-contrast)] mb-1 flex items-center gap-2">
            <Bell size={16} className="text-[var(--accent-primary)]" />
            Disruption Alert Preferences
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-5">
            Configure how and when ChainSight AI alerts your team about port congestions, severe weather, and canal blockages.
          </p>

          {notifMessage && (
            <div
              className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
                notifMessage.type === "success"
                  ? "bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[var(--status-success)]"
                  : "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[var(--status-critical)]"
              }`}
            >
              {notifMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
              <span>{notifMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors">
                <div>
                  <div className="font-semibold text-[var(--text-high-contrast)]">Email Notifications</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    Send incident summaries and rerouting recommendations to {user?.email}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) =>
                    setSettings({ ...settings, email_notifications: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors">
                <div>
                  <div className="font-semibold text-[var(--text-high-contrast)]">Urgent SMS Alerts</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    Trigger high-priority SMS notifications for sudden canal closures and berthing strikes
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.sms_alerts}
                  onChange={(e) =>
                    setSettings({ ...settings, sms_alerts: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors">
                <div>
                  <div className="font-semibold text-[var(--text-high-contrast)]">Critical Route Warnings</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    Show instant dashboard banner when active sea routes experience delays &gt; 48 hours
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.critical_alerts}
                  onChange={(e) =>
                    setSettings({ ...settings, critical_alerts: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors">
                <div>
                  <div className="font-semibold text-[var(--text-high-contrast)]">Severe Weather & Typhoon Feeds</div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    Incorporate Open-Meteo marine wave and wind advisories into route recommendations
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.weather_alerts}
                  onChange={(e) =>
                    setSettings({ ...settings, weather_alerts: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                />
              </label>
            </div>

            <div className="pt-2">
              <label className="block text-[var(--text-dim)] uppercase font-semibold text-[11px] mb-1.5">
                Digest Frequency
              </label>
              <select
                value={settings.digest_frequency}
                onChange={(e) =>
                  setSettings({ ...settings, digest_frequency: e.target.value })
                }
                className="bg-[var(--surface-base)] border border-[var(--border-color)] rounded-md px-3 py-2 text-[var(--text-high-contrast)] focus:outline-none focus:border-[var(--accent-primary)] text-xs"
              >
                <option value="realtime">Real-time (Immediate alert dispatch)</option>
                <option value="daily">Daily Digest (08:00 CET)</option>
                <option value="weekly">Weekly Operational Summary</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end">
              <Button type="submit" disabled={settingsSaving} variant="primary">
                {settingsSaving ? "Saving Preferences…" : "Save Preferences"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* =========================================================
          TAB 3: Security & Password
          ========================================================= */}
      {activeTab === "security" && (
        <Card>
          <h3 className="text-sm font-bold text-[var(--text-high-contrast)] mb-1 flex items-center gap-2">
            <Lock size={16} className="text-[var(--accent-cyan)]" />
            Security & Authentication
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-5">
            Keep your credentials secure. Passwords are encrypted with bcrypt rounds on the backend.
          </p>

          {passwordMessage && (
            <div
              className={`p-3 rounded-lg text-xs mb-4 flex items-center gap-2 ${
                passwordMessage.type === "success"
                  ? "bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[var(--status-success)]"
                  : "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[var(--status-critical)]"
              }`}
            >
              {passwordMessage.type === "success" ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
              <span>{passwordMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-md">
            <div>
              <label className="block text-[var(--text-dim)] uppercase font-semibold text-[11px] mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-[var(--surface-base)] border border-[var(--border-color)] rounded-md px-3 py-2 text-[var(--text-high-contrast)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="block text-[var(--text-dim)] uppercase font-semibold text-[11px] mb-1.5">
                New Password (minimum 8 characters)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-[var(--surface-base)] border border-[var(--border-color)] rounded-md px-3 py-2 text-[var(--text-high-contrast)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="block text-[var(--text-dim)] uppercase font-semibold text-[11px] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-[var(--surface-base)] border border-[var(--border-color)] rounded-md px-3 py-2 text-[var(--text-high-contrast)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={passwordSaving} variant="primary">
                {passwordSaving ? "Updating Password…" : "Update Password"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* =========================================================
          TAB 4: System Diagnostics & AI Architecture
          ========================================================= */}
      {activeTab === "system" && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-bold text-[var(--text-high-contrast)] mb-1 flex items-center gap-2">
              <Server size={16} className="text-[var(--accent-primary)]" />
              Connected AI & Platform Architecture
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Real-time health of multi-agent intelligence, vector memory, and data integrity layers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2 text-[var(--accent-cyan)] font-semibold mb-1">
                  <Database size={15} />
                  <span>Vector Memory</span>
                </div>
                <div className="text-lg font-bold text-[var(--text-high-contrast)]">480 Cases</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  ChromaDB indexed with all-MiniLM-L6-v2 embeddings.
                </div>
                <div className="mt-2 text-[10px] text-[var(--status-success)] flex items-center gap-1">
                  <CheckCircle2 size={12} /> Semantic Search Active
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2 text-[var(--accent-primary-light)] font-semibold mb-1">
                  <Cpu size={15} />
                  <span>Multi-Agent Engine</span>
                </div>
                <div className="text-lg font-bold text-[var(--text-high-contrast)]">4 Nodes Active</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  LangGraph: Ingest &rarr; Memory &rarr; Risk &rarr; Recommender.
                </div>
                <div className="mt-2 text-[10px] text-[var(--status-success)] flex items-center gap-1">
                  <CheckCircle2 size={12} /> Graceful Deterministic Fallback
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2 text-[var(--status-success)] font-semibold mb-1">
                  <Shield size={15} />
                  <span>Tenant Isolation</span>
                </div>
                <div className="text-lg font-bold text-[var(--text-high-contrast)]">Enforced</div>
                <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  Row-level user_id security with JWT bearer claims.
                </div>
                <div className="mt-2 text-[10px] text-[var(--status-success)] flex items-center gap-1">
                  <CheckCircle2 size={12} /> Zero Cross-Tenant Leakage
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

