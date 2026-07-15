import { useEffect, useRef, useState } from 'react';

import API from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { saveReaderPrefs } from './StoryReader';

function ReadingPreferencesPanel({ onPrefsChange }) {
  const { isAuthenticated } = useAuth();
  const { isDarkMode, toggleDarkMode, registerDarkModeListener } = useTheme();
  const [prefs, setPrefs] = useState({
    font_size: 18,
    line_spacing: 1.6,
    font_family: 'Inter, sans-serif',
    auto_bookmark: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Keep a ref to latest prefs so the dark-mode listener callback always has
  // fresh data without needing to be re-registered every time prefs change.
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  // ── Load user preferences from the server on mount ──────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
      try {
        const res = await API.preferences.get();
        const p = res.preferences;
        if (p) {
          const loaded = {
            font_size: p.font_size,
            line_spacing: Number(p.line_spacing),
            font_family: p.font_family,
            auto_bookmark: p.auto_bookmark,
          };
          setPrefs(loaded);
          prefsRef.current = loaded;
          saveReaderPrefs({
            fontSize: loaded.font_size,
            lineSpacing: loaded.line_spacing,
            fontFamily: loaded.font_family,
          });
          onPrefsChange?.(p);
        }
      } catch {
        // keep defaults
      }
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ── Sync dark-mode to server whenever it changes (from ANY toggle) ───────
  useEffect(() => {
    if (!isAuthenticated || !registerDarkModeListener) return;

    // This callback is called by ThemeContext every time isDarkMode changes,
    // including when the Navbar button is clicked.
    const unregister = registerDarkModeListener(async (dark) => {
      try {
        await API.preferences.update({ ...prefsRef.current, dark_mode: dark });
      } catch {
        // silent — UI already reflects the change locally
      }
    });

    return unregister;
  }, [isAuthenticated, registerDarkModeListener]);

  // ── Save non-darkmode preferences ────────────────────────────────────────
  const save = async (updates) => {
    const next = { ...prefs, ...updates };
    setPrefs(next);
    prefsRef.current = next;
    onPrefsChange?.(next);
    saveReaderPrefs({
      fontSize: next.font_size,
      lineSpacing: next.line_spacing,
      fontFamily: next.font_family,
    });

    if (!isAuthenticated) return;

    try {
      setSaving(true);
      await API.preferences.update({
        ...next,
        // Use the ref so we always have the most current dark_mode value
        dark_mode: isDarkMode,
      });
      setMessage('Đã lưu cài đặt');
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setMessage('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <p className="text-muted small mb-0">
        Đăng nhập để đồng bộ cài đặt đọc trên mọi thiết bị.
      </p>
    );
  }

  return (
    <div className="panel-card">
      <h5 className="panel-title">Cài đặt đọc</h5>
      {message ? <p className="small text-success mb-2">{message}</p> : null}

      <label className="setting-row">
        <span>Cỡ chữ</span>
        <input
          type="range"
          min="14"
          max="28"
          value={prefs.font_size}
          onChange={(e) => save({ font_size: Number(e.target.value) })}
        />
        <span className="small">{prefs.font_size}px</span>
      </label>

      <label className="setting-row">
        <span>Giãn dòng</span>
        <input
          type="range"
          min="1.2"
          max="2.4"
          step="0.1"
          value={prefs.line_spacing}
          onChange={(e) => save({ line_spacing: Number(e.target.value) })}
        />
      </label>

      {/* Dark-mode toggle — uses the same toggleDarkMode as the Navbar button.
          ThemeContext will notify the listener above which syncs to the server. */}
      <label className="setting-row">
        <span>Giao diện tối</span>
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleDarkMode}
        />
      </label>

      <label className="setting-row">
        <span>Tự động đánh dấu chương</span>
        <input
          type="checkbox"
          checked={prefs.auto_bookmark}
          onChange={(e) => save({ auto_bookmark: e.target.checked })}
        />
      </label>

      {saving ? <p className="small text-muted mb-0">Đang lưu...</p> : null}
    </div>
  );
}

export default ReadingPreferencesPanel;

