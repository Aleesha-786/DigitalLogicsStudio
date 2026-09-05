import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../shared/components/navbar";
import Footer from "../../shared/components/Footer";
import { useTheme } from "../../shared/context/ThemeContext";
import { useAuth } from "../../auth/context/AuthContext";
import { SettingsHeader, SettingsSidebar, MainPanelHeader } from "./components";
import {
  ProfileSection,
  AppearanceSection,
  NotificationsSection,
  SecuritySection,
  PrivacySection,
  DangerSection,
} from "./components/sections";
import { useIsMobile } from "./hooks";
import { SECTIONS, MOBILE_BREAKPOINT } from "./utils";
import "./Settings.css";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const {
    user,
    emailNotificationsOptedOut,
    updateNotificationPreferences,
    changePassword,
    deleteAccount,
    updateProfile,
  } = useAuth();

  const [activeSection, setActiveSection] = useState("profile");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const isMobile = useIsMobile(MOBILE_BREAKPOINT);

  const activeMeta = SECTIONS.find((section) => section.id === activeSection);

  // On mobile the sidebar IS the main screen; picking a section drills into
  // a full-screen detail view. On desktop both panels are always visible.
  const handleSelectSection = (id) => {
    setActiveSection(id);
    if (isMobile) setMobileDetailOpen(true);
  };

  const handleBack = () => setMobileDetailOpen(false);

  const showSidebar = !isMobile || !mobileDetailOpen;
  const showMain = !isMobile || mobileDetailOpen;
  const showPageHeader = !isMobile || !mobileDetailOpen;

  return (
    <div className="settings-page-shell">
      <Navbar toggleTheme={toggleTheme} theme={theme} />

      <main className="settings-page-main">
        {showPageHeader && <SettingsHeader user={user} />}

        <div className="settings-shell">
          {showSidebar && (
            <SettingsSidebar
              sections={SECTIONS}
              activeSection={activeSection}
              onSelect={handleSelectSection}
            />
          )}

          {showMain && (
            <div className="settings-main">
              {isMobile && (
                <MainPanelHeader title={activeMeta?.label} onBack={handleBack} />
              )}

              <div className="settings-content">
                {activeSection === "profile" && (
                  <ProfileSection user={user} updateProfile={updateProfile} />
                )}
                {activeSection === "appearance" && (
                  <AppearanceSection theme={theme} toggleTheme={toggleTheme} />
                )}
                {activeSection === "notifications" && (
                  <NotificationsSection
                    emailNotificationsOptedOut={emailNotificationsOptedOut}
                    updateNotificationPreferences={updateNotificationPreferences}
                  />
                )}
                {activeSection === "security" && (
                  <SecuritySection changePassword={changePassword} />
                )}
                {activeSection === "privacy" && <PrivacySection user={user} />}
                {activeSection === "danger" && (
                  <DangerSection deleteAccount={deleteAccount} navigate={navigate} />
                )}
              </div>

              <div className="settings-footer-wrap">
                <Footer />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
