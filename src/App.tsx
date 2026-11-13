import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './components/home/HomePage';
import { LibraryPage } from './components/library/LibraryPage';
import { RecentPage } from './components/recent/RecentPage';
import { FavoritesPage } from './components/favorites/FavoritesPage';
import { SyncPage } from './components/sync/SyncPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ReaderPage } from './components/reader/ReaderPage';
import { useBookStore } from './stores/bookStore';

function App() {
  const initialize = useBookStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/reader" element={<ReaderPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="recent" element={<RecentPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="sync" element={<SyncPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
