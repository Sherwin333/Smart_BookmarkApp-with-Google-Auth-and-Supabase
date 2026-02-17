"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    if (user) fetchBookmarks(user.id);
    setLoading(false);
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setBookmarks([]);
    toast.success("Logged out");
  }

  async function addOrUpdateBookmark() {
    if (!user || !title || !url) return;

    if (editingId) {
      const { error } = await supabase
        .from("bookmarks")
        .update({ title, url })
        .eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("Bookmark updated");
      setEditingId(null);
    } else {
      const { error } = await supabase.from("bookmarks").insert({ title, url, user_id: user.id });
      if (error) { toast.error(error.message); return; }
      toast.success("Bookmark added");
    }

    setTitle("");
    setUrl("");
    fetchBookmarks(user.id);
  }

  async function deleteBookmark(id: string) {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Bookmark deleted");
    if (user) fetchBookmarks(user.id);
  }

  async function fetchBookmarks(userId: string) {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    if (data) setBookmarks(data);
  }

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <>
        <style>{globalStyles}</style>
        <div className="loader-screen">
          <div className="loader-dot" />
          <div className="loader-dot" style={{ animationDelay: "0.15s" }} />
          <div className="loader-dot" style={{ animationDelay: "0.3s" }} />
        </div>
      </>
    );

  return (
    <>
      <style>{globalStyles}</style>
      <div className={`root-wrap ${darkMode ? "dark" : "light"}`}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: darkMode ? "#1a1a2e" : "#fff",
              color: darkMode ? "#e2e8f0" : "#1a1a2e",
              border: `1px solid ${darkMode ? "#2d2d4e" : "#e2e8f0"}`,
              borderRadius: "12px",
              fontSize: "13px",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            },
          }}
        />

        {/* Ambient background blobs */}
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />
        <div className="bg-blob blob-3" />

        <div className="page-center">
          <div className="card">

            {/* ── Header ── */}
            <div className="card-header">
              <div className="brand">
                <div className="brand-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="brand-name">Smart Bookmark</span>
              </div>

              <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle theme">
                {darkMode ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
                <span>{darkMode ? "Light" : "Dark"}</span>
              </button>
            </div>

            <div className="card-divider" />

            {/* ── Login / App ── */}
            {!user ? (
              <div className="login-section">
                <div className="login-illustration">
                  <div className="illustration-ring ring-outer" />
                  <div className="illustration-ring ring-mid" />
                  <div className="illustration-ring ring-inner" />
                  <div className="illustration-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                </div>
                <h2 className="login-title">Your bookmarks, elevated.</h2>
                <p className="login-sub">Save, search, and access your favourite links from anywhere.</p>

                <button className="btn-google" onClick={loginWithGoogle}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>
            ) : (
              <>
                {/* ── User bar ── */}
                <div className="user-bar">
                  <div className="user-avatar">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-email">{user.email}</span>
                  <button className="btn-logout" onClick={logout}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign out
                  </button>
                </div>

                {/* ── Form ── */}
                <div className="form-section">
                  <div className="form-label">{editingId ? "✦ Edit bookmark" : "✦ Add new bookmark"}</div>
                  <div className="input-group">
                    <div className="input-wrap">
                      <span className="input-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="field"
                        onKeyDown={(e) => e.key === "Enter" && addOrUpdateBookmark()}
                      />
                    </div>

                    <div className="input-wrap">
                      <span className="input-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="https://"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="field"
                        onKeyDown={(e) => e.key === "Enter" && addOrUpdateBookmark()}
                      />
                    </div>

                    <div className="form-actions">
                      <button className="btn-primary" onClick={addOrUpdateBookmark} disabled={!title || !url}>
                        {editingId ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Update
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Bookmark
                          </>
                        )}
                      </button>

                      {editingId && (
                        <button className="btn-cancel" onClick={() => { setEditingId(null); setTitle(""); setUrl(""); }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Search ── */}
                <div className="search-wrap">
                  <span className="search-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search bookmarks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-field"
                  />
                  {search && (
                    <button className="search-clear" onClick={() => setSearch("")}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* ── List ── */}
                <div className="bookmark-list">
                  {filteredBookmarks.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <p className="empty-text">{search ? "No matches found" : "No bookmarks yet"}</p>
                      <p className="empty-sub">{search ? "Try a different search term" : "Add your first bookmark above"}</p>
                    </div>
                  ) : (
                    <>
                      <div className="list-meta">{filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? "s" : ""}</div>
                      {filteredBookmarks.map((bookmark, i) => (
                        <div
                          key={bookmark.id}
                          className="bookmark-item"
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <div className="bookmark-favicon">
                            <img
                              src={`https://www.google.com/s2/favicons?sz=32&domain_url=${bookmark.url}`}
                              alt=""
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          </div>

                          <div className="bookmark-content">
                            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="bookmark-title">
                              {bookmark.title}
                            </a>
                            <span className="bookmark-url">{bookmark.url.replace(/^https?:\/\//, "").split("/")[0]}</span>
                          </div>

                          <div className="bookmark-actions">
                            <button
                              className="icon-btn edit-btn"
                              title="Edit"
                              onClick={() => { setEditingId(bookmark.id); setTitle(bookmark.title); setUrl(bookmark.url); }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>

                            <button
                              className="icon-btn delete-btn"
                              title="Delete"
                              onClick={() => deleteBookmark(bookmark.id)}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Styles
───────────────────────────────────────────── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Tokens ── */
  .light {
    --bg: #f0ede8;
    --bg-blob-1: rgba(99,102,241,0.08);
    --bg-blob-2: rgba(168,85,247,0.06);
    --bg-blob-3: rgba(236,72,153,0.05);
    --card-bg: #fdfcfb;
    --card-border: rgba(0,0,0,0.06);
    --card-shadow: 0 2px 4px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06), 0 32px 64px rgba(0,0,0,0.04);
    --text-primary: #0f0e0d;
    --text-secondary: #6b6762;
    --text-muted: #a09b97;
    --accent: #5b4cdb;
    --accent-soft: rgba(91,76,219,0.08);
    --accent-hover: #4a3ccc;
    --divider: rgba(0,0,0,0.06);
    --input-bg: #f7f5f3;
    --input-border: rgba(0,0,0,0.08);
    --input-focus: rgba(91,76,219,0.25);
    --item-bg: #f7f5f3;
    --item-hover: #f0ede8;
    --item-border: rgba(0,0,0,0.05);
    --brand-icon-bg: linear-gradient(135deg, #5b4cdb, #8b5cf6);
    --user-avatar-bg: linear-gradient(135deg, #5b4cdb, #8b5cf6);
    --edit-bg: rgba(245,158,11,0.1);
    --edit-color: #d97706;
    --edit-hover: rgba(245,158,11,0.2);
    --del-bg: rgba(239,68,68,0.08);
    --del-color: #dc2626;
    --del-hover: rgba(239,68,68,0.15);
    --logout-bg: rgba(239,68,68,0.07);
    --logout-color: #dc2626;
    --logout-hover: rgba(239,68,68,0.13);
    --empty-icon: rgba(0,0,0,0.12);
    --theme-btn-bg: rgba(0,0,0,0.05);
    --theme-btn-hover: rgba(0,0,0,0.09);
  }

  .dark {
    --bg: #0c0b12;
    --bg-blob-1: rgba(99,102,241,0.12);
    --bg-blob-2: rgba(168,85,247,0.09);
    --bg-blob-3: rgba(236,72,153,0.07);
    --card-bg: #13121e;
    --card-border: rgba(255,255,255,0.05);
    --card-shadow: 0 2px 4px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4), 0 32px 80px rgba(0,0,0,0.35);
    --text-primary: #eeeaf8;
    --text-secondary: #9490b0;
    --text-muted: #5e5a75;
    --accent: #7c6ff0;
    --accent-soft: rgba(124,111,240,0.12);
    --accent-hover: #9084f5;
    --divider: rgba(255,255,255,0.06);
    --input-bg: #1c1b2c;
    --input-border: rgba(255,255,255,0.07);
    --input-focus: rgba(124,111,240,0.3);
    --item-bg: #1c1b2c;
    --item-hover: #221f34;
    --item-border: rgba(255,255,255,0.04);
    --brand-icon-bg: linear-gradient(135deg, #7c6ff0, #a78bfa);
    --user-avatar-bg: linear-gradient(135deg, #7c6ff0, #a78bfa);
    --edit-bg: rgba(251,191,36,0.08);
    --edit-color: #fbbf24;
    --edit-hover: rgba(251,191,36,0.15);
    --del-bg: rgba(248,113,113,0.08);
    --del-color: #f87171;
    --del-hover: rgba(248,113,113,0.15);
    --logout-bg: rgba(248,113,113,0.07);
    --logout-color: #f87171;
    --logout-hover: rgba(248,113,113,0.13);
    --empty-icon: rgba(255,255,255,0.1);
    --theme-btn-bg: rgba(255,255,255,0.05);
    --theme-btn-hover: rgba(255,255,255,0.09);
  }

  /* ── Layout ── */
  .root-wrap {
    min-height: 100vh;
    background-color: var(--bg);
    font-family: 'DM Sans', sans-serif;
    transition: background-color 0.4s ease;
    position: relative;
    overflow: hidden;
  }

  .page-center {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
    position: relative;
    z-index: 1;
  }

  /* ── Background blobs ── */
  .bg-blob {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
    transition: opacity 0.5s ease;
  }
  .blob-1 {
    width: 500px; height: 500px;
    top: -150px; left: -100px;
    background: var(--bg-blob-1);
    animation: blobFloat 18s ease-in-out infinite;
  }
  .blob-2 {
    width: 400px; height: 400px;
    bottom: -100px; right: -80px;
    background: var(--bg-blob-2);
    animation: blobFloat 22s ease-in-out infinite reverse;
  }
  .blob-3 {
    width: 300px; height: 300px;
    top: 50%; left: 60%;
    background: var(--bg-blob-3);
    animation: blobFloat 16s ease-in-out infinite 4s;
  }
  @keyframes blobFloat {
    0%,100% { transform: translate(0,0) scale(1); }
    33% { transform: translate(30px,-20px) scale(1.05); }
    66% { transform: translate(-20px,15px) scale(0.97); }
  }

  /* ── Card ── */
  .card {
    width: 100%;
    max-width: 560px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 24px;
    box-shadow: var(--card-shadow);
    padding: 32px;
    transition: background 0.4s ease, border-color 0.4s ease;
    animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Header ── */
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-icon {
    width: 36px; height: 36px;
    background: var(--brand-icon-bg);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }

  .brand-name {
    font-family: 'Instrument Serif', serif;
    font-size: 20px;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--theme-btn-bg);
    border: none;
    color: var(--text-secondary);
    padding: 8px 14px;
    border-radius: 100px;
    font-size: 12.5px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
  }
  .theme-toggle:hover { background: var(--theme-btn-hover); color: var(--text-primary); }

  .card-divider {
    height: 1px;
    background: var(--divider);
    margin-bottom: 24px;
  }

  /* ── Login ── */
  .login-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0 12px;
    gap: 0;
  }

  .login-illustration {
    position: relative;
    width: 100px; height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }

  .illustration-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid var(--divider);
    animation: ringPulse 3s ease-in-out infinite;
  }
  .ring-outer { width: 100px; height: 100px; animation-delay: 0s; }
  .ring-mid { width: 72px; height: 72px; animation-delay: 0.4s; }
  .ring-inner { width: 48px; height: 48px; animation-delay: 0.8s; }

  @keyframes ringPulse {
    0%,100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.03); }
  }

  .illustration-icon {
    width: 44px; height: 44px;
    background: var(--brand-icon-bg);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    position: relative;
    z-index: 1;
    box-shadow: 0 8px 24px rgba(91,76,219,0.35);
  }

  .login-title {
    font-family: 'Instrument Serif', serif;
    font-size: 26px;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin-bottom: 8px;
    text-align: center;
  }

  .login-sub {
    font-size: 14px;
    color: var(--text-secondary);
    text-align: center;
    line-height: 1.6;
    margin-bottom: 32px;
    max-width: 280px;
  }

  .btn-google {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    color: var(--text-primary);
    padding: 13px 28px;
    border-radius: 14px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .btn-google:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  }
  .btn-google:active { transform: translateY(0); }

  /* ── User bar ── */
  .user-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--input-bg);
    padding: 10px 14px;
    border-radius: 14px;
    margin-bottom: 24px;
    border: 1px solid var(--input-border);
  }

  .user-avatar {
    width: 28px; height: 28px;
    background: var(--user-avatar-bg);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    flex-shrink: 0;
  }

  .user-email {
    font-size: 13px;
    color: var(--text-secondary);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .btn-logout {
    display: flex;
    align-items: center;
    gap: 5px;
    background: var(--logout-bg);
    border: none;
    color: var(--logout-color);
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .btn-logout:hover { background: var(--logout-hover); }

  /* ── Form ── */
  .form-section {
    margin-bottom: 20px;
  }

  .form-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 10px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    left: 14px;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    pointer-events: none;
  }

  .field {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    padding: 12px 14px 12px 38px;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .field::placeholder { color: var(--text-muted); }
  .field:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--input-focus);
  }

  .form-actions {
    display: flex;
    gap: 8px;
  }

  .btn-primary {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, opacity 0.2s;
  }
  .btn-primary:hover:not(:disabled) { background: var(--accent-hover); transform: translateY(-1px); }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }
  .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  .btn-cancel {
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-secondary);
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.2s;
  }
  .btn-cancel:hover { background: var(--item-hover); }

  /* ── Search ── */
  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 16px;
  }

  .search-icon {
    position: absolute;
    left: 14px;
    color: var(--text-muted);
    display: flex;
    pointer-events: none;
  }

  .search-field {
    width: 100%;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    color: var(--text-primary);
    padding: 12px 40px 12px 40px;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-field::placeholder { color: var(--text-muted); }
  .search-field:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--input-focus);
  }

  .search-clear {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    padding: 4px;
    border-radius: 6px;
    transition: color 0.2s, background 0.2s;
  }
  .search-clear:hover { color: var(--text-primary); background: var(--item-hover); }

  /* ── Bookmark list ── */
  .bookmark-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .list-meta {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 4px;
    padding: 0 2px;
  }

  .bookmark-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--item-bg);
    border: 1px solid var(--item-border);
    padding: 13px 14px;
    border-radius: 14px;
    transition: background 0.2s, transform 0.2s, border-color 0.2s;
    animation: itemIn 0.3s cubic-bezier(0.16,1,0.3,1) both;
  }
  @keyframes itemIn {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .bookmark-item:hover {
    background: var(--item-hover);
    transform: translateX(2px);
  }

  .bookmark-favicon {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: var(--divider);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }
  .bookmark-favicon img { width: 18px; height: 18px; object-fit: contain; }

  .bookmark-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .bookmark-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    text-decoration: none;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.2s;
  }
  .bookmark-title:hover { color: var(--accent); }

  .bookmark-url {
    font-size: 11.5px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .bookmark-actions {
    display: flex;
    gap: 5px;
    flex-shrink: 0;
  }

  .icon-btn {
    width: 30px; height: 30px;
    border: none;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
  }
  .icon-btn:hover { transform: scale(1.08); }

  .edit-btn { background: var(--edit-bg); color: var(--edit-color); }
  .edit-btn:hover { background: var(--edit-hover); }

  .delete-btn { background: var(--del-bg); color: var(--del-color); }
  .delete-btn:hover { background: var(--del-hover); }

  /* ── Empty state ── */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 40px 0;
  }

  .empty-icon {
    width: 56px; height: 56px;
    background: var(--item-bg);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--empty-icon);
    margin-bottom: 8px;
  }

  .empty-text {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .empty-sub {
    font-size: 13px;
    color: var(--text-muted);
  }

  /* ── Loader ── */
  .loader-screen {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #0c0b12;
  }

  .loader-dot {
    width: 8px; height: 8px;
    background: #7c6ff0;
    border-radius: 50%;
    animation: dotBounce 0.8s ease-in-out infinite;
  }
  @keyframes dotBounce {
    0%,80%,100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  /* ── Scrollbar ── */
  .bookmark-list::-webkit-scrollbar { width: 4px; }
  .bookmark-list::-webkit-scrollbar-track { background: transparent; }
  .bookmark-list::-webkit-scrollbar-thumb { background: var(--divider); border-radius: 4px; }

  @media (max-width: 480px) {
    .card { padding: 24px 20px; border-radius: 20px; }
    .brand-name { font-size: 17px; }
    .theme-toggle span { display: none; }
  }
`;