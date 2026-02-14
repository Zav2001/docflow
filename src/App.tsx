import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./hooks/useRedux";
import { setDocuments } from "./features/documents/store/documentsSlice";
import { setAnnotations } from "./features/annotations/store/annotationsSlice";
import { docApi } from "./api/docApi";
import { userApi } from "./api/userApi";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RoleProvider } from "./hooks/useRole";
import { Sidebar } from "./components/Sidebar";
import { UploadZone, type UploadZoneHandle } from "./components/UploadZone";
import { ShortcutsHelp } from "./components/ShortcutsHelp";
import { DocumentDashboard } from "./features/documents/components/DocumentDashboard";
import { DocumentViewerPage } from "./pages/DocumentViewerPage";
import { TeamPage } from "./pages/TeamPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { useNavigate } from "react-router-dom";
import { setNotifications } from "./features/notifications/store/notificationsSlice";
import { setCurrentUser } from "./features/session/store/sessionSlice";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { useRole } from "./hooks/useRole";
import type { AppPermission } from "./auth/permissions";

function AppContent() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const uploadZoneRef = useRef<UploadZoneHandle>(null);

  const documentsEntities = useAppSelector((state) => state.documents.entities);
  const documents = useMemo(
    () => Object.values(documentsEntities),
    [documentsEntities],
  );
  const currentUser = useAppSelector((state) => state.session.currentUser);
  const sessionInitialized = useAppSelector(
    (state) => state.session.initialized,
  );
  const { can } = useRole();

  const refreshDocuments = useCallback(async () => {
    const docs = await docApi.getDocuments();
    dispatch(setDocuments(docs));
    return docs;
  }, [dispatch]);

  const refreshNotifications = useCallback(async () => {
    const [notifications, activeUser] = await Promise.all([
      userApi.getNotifications(),
      userApi.getCurrentUser(),
    ]);
    const muted = activeUser?.preferences?.mutedNotificationTypes || [];
    const visible = notifications.filter((n) => !muted.includes(n.type));
    dispatch(setNotifications(visible));
    return visible;
  }, [dispatch]);

  useEffect(() => {
    // Initialize storage and fetch data
    const init = async () => {
      await docApi.initialize();
      const currentUser = await userApi.getCurrentUser();
      dispatch(setCurrentUser(currentUser));
    };
    init();
  }, [dispatch]);

  useEffect(() => {
    const hydrateWorkspace = async () => {
      if (!currentUser) {
        dispatch(setDocuments([]));
        dispatch(setNotifications([]));
        return;
      }

      const docs = await refreshDocuments();
      await refreshNotifications();

      if (docs.length > 0) {
        const annotations = await docApi.getAnnotations(docs[0].id);
        dispatch(setAnnotations(annotations));
      } else {
        dispatch(setAnnotations([]));
      }
    };
    hydrateWorkspace();
  }, [currentUser, dispatch, refreshDocuments, refreshNotifications]);

  useEffect(() => {
    if (!currentUser) return;
    const id = window.setInterval(() => {
      refreshNotifications();
    }, 15000);
    return () => window.clearInterval(id);
  }, [currentUser, refreshNotifications]);

  // Global keyboard shortcut for help
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.shiftKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectDocument = (id: string) => {
    navigate(`/documents/${id}`);
  };

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      await docApi.uploadDocument(file);
    }
    await Promise.all([refreshDocuments(), refreshNotifications()]);
  };

  const handleTriggerUpload = () => {
    uploadZoneRef.current?.open();
  };

  const renderProtected = (permission: AppPermission, element: ReactNode) =>
    can(permission) ? element : <UnauthorizedPage />;

  if (!sessionInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
          Initializing workspace...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 font-sans text-gray-900 dark:text-slate-100 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex overflow-hidden bg-slate-50 dark:bg-slate-950">
        <Routes>
          <Route
            path="/"
            element={
              <DocumentDashboard
                documents={documents as any}
                onSelect={handleSelectDocument}
                onNewUpload={handleTriggerUpload}
                onDocumentsChanged={async () => {
                  await refreshDocuments();
                }}
              />
            }
          />
          <Route
            path="/documents/:documentId"
            element={<DocumentViewerPage />}
          />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route
            path="/analytics"
            element={renderProtected("analytics:view", <AnalyticsPage />)}
          />
          <Route
            path="/team"
            element={renderProtected("team:view", <TeamPage />)}
          />
          <Route
            path="/notifications"
            element={renderProtected(
              "notifications:view",
              <NotificationsPage />,
            )}
          />
          <Route
            path="/settings"
            element={renderProtected("settings:manage", <SettingsPage />)}
          />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <UploadZone ref={uploadZoneRef} onUpload={handleUpload} />
      <ShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <RoleProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </RoleProvider>
    </ThemeProvider>
  );
}

export default App;
