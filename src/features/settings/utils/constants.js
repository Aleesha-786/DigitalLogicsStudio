import { User, Palette, Bell, ShieldCheck, Trash2 } from "lucide-react";

// Below this width, the sidebar and main panel stop being side-by-side and
// become two full-screen views (list -> detail) with a back button.
export const MOBILE_BREAKPOINT = 880;

// Single source of truth for the settings nav. `description` is only shown
// in the mobile list view, where each row needs more context than an icon.
export const SECTIONS = [
  {
    id: "profile",
    label: "Profile",
    description: "Photo, display name, and email",
    icon: User,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme and motion preferences",
    icon: Palette,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Emails and progress updates",
    icon: Bell,
  },
  {
    id: "security",
    label: "Security",
    description: "Password and sign-in protection",
    icon: ShieldCheck,
  },
  {
    id: "danger",
    label: "Danger Zone",
    description: "Delete your account",
    icon: Trash2,
    isDanger: true,
  },
];
