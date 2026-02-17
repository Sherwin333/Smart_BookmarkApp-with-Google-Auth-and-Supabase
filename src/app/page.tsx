"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from "react-hot-toast";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  LayoutGroup,
} from "framer-motion";

// ─── Spring configs ───────────────────────────────────────────────
const spring = { type: "spring", stiffness: 400, damping: 30 };
const softSpring = { type: "spring", stiffness: 260, damping: 28 };
const gentleSpring = { type: "spring", stiffness: 180, damping: 24 };

// ─── Reusable variants ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: (i = 0) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { ...softSpring, delay: i * 0.06 },
  }),
  exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.18 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
  show: { opacity: 1, scale: 1, filter: "blur(0px)", transition: gentleSpring },
  exit: { opacity: 0, scale: 0.94, filter: "blur(4px)", transition: { duration: 0.2 } },
};

// ─── Magnetic button ──────────────────────────────────────────────
function MagneticButton({ children, className, onClick, disabled, title, style }: any) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  function onMove(e: React.MouseEvent) {
    if (disabled || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
  }
  function onLeave() { x.set(0); y.set(0); }

  return (
    <motion.button
      ref={ref} className={className} onClick={onClick}
      disabled={disabled} title={title}
      style={{ x: sx, y: sy, ...style }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

// ─── Field input ──────────────────────────────────────────────────
function FieldInput({ icon, placeholder, value, onChange, onEnter }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <motion.div className="field-wrap" animate={{ scale: focused ? 1.01 : 1 }} transition={spring}>
      <span className={`f-icon ${focused ? "active" : ""}`}>{icon}</span>
      <input
        className="field" type="text" placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onKeyDown={e => e.key === "Enter" && onEnter()}
      />
      <AnimatePresence>
        {focused && (
          <motion.div className="field-glow"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Bookmark row ─────────────────────────────────────────────────
function BookmarkRow({ bookmark, index, onEdit, onDelete }: any) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete();
  }

  return (
    <motion.div
      layout className="bk-item"
      initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)", transition: { ...softSpring, delay: index * 0.05 } }}
      exit={{ opacity: 0, x: 20, scale: 0.95, filter: "blur(4px)", transition: { duration: 0.22 } }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => { setHovered(false); setConfirmDelete(false); }}
      whileHover={{ x: 3 }} transition={spring}
    >
      <div className="bk-fav">
        <img
          src={`https://www.google.com/s2/favicons?sz=32&domain_url=${bookmark.url}`}
          alt="" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      <div className="bk-text">
        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="bk-title">
          {bookmark.title}
        </a>
        <span className="bk-domain">
          {bookmark.url.replace(/^https?:\/\//, "").split("/")[0]}
        </span>
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div className="bk-actions"
            initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }} transition={spring}
          >
            <MagneticButton className="icon-btn edit-btn" title="Edit" onClick={onEdit}>
              <PenIcon />
            </MagneticButton>
            <MagneticButton
              className={`icon-btn del-btn ${confirmDelete ? "confirm" : ""}`}
              title={confirmDelete ? "Click again to confirm" : "Delete"}
              onClick={handleDelete}
            >
              <AnimatePresence mode="wait">
                <motion.span key={confirmDelete ? "warn" : "del"}
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}
                  style={{ display: "flex" }}
                >
                  {confirmDelete ? <AlertIcon /> : <TrashIcon />}
                </motion.span>
              </AnimatePresence>
            </MagneticButton>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hovered && (
          <motion.div className="bk-shimmer"
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkUser(); }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) fetchBookmarks(user.id);
    setLoading(false);
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null); setBookmarks([]);
    toast.success("Signed out");
  }

  async function addOrUpdateBookmark() {
    if (!user || !title || !url) return;
    if (editingId) {
      const { error } = await supabase.from("bookmarks").update({ title, url }).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("Bookmark updated");
      setEditingId(null);
    } else {
      const { error } = await supabase.from("bookmarks").insert({ title, url, user_id: user.id });
      if (error) { toast.error(error.message); return; }
      toast.success("Bookmark saved");
    }
    setTitle(""); setUrl("");
    fetchBookmarks(user.id);
  }

  async function deleteBookmark(id: string) {
    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    if (user) fetchBookmarks(user.id);
  }

  async function fetchBookmarks(userId: string) {
    const { data, error } = await supabase.from("bookmarks").select("*").order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    if (data) setBookmarks(data);
  }

  const filtered = bookmarks.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  // ── Loading ─────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{css}</style>
      <div className="loader-screen">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="loader-dot"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
          />
        ))}
      </div>
    </>
  );

  // ── App ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <motion.div
        className={`root ${darkMode ? "dark" : "light"}`}
        animate={{ backgroundColor: darkMode ? "#080810" : "#f4f1ed" }}
        transition={{ duration: 0.5 }}
      >
        <Toaster position="top-right" toastOptions={{
          style: {
            background: darkMode ? "#16152a" : "#fff",
            color: darkMode ? "#e2dff5" : "#16152a",
            border: `1px solid ${darkMode ? "#2a2845" : "#e5e0d8"}`,
            borderRadius: "14px", fontSize: "13px",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
          },
        }} />

        {/* Blobs */}
        <div className="blobs" aria-hidden>
          {[
            { cls: "b1", x: [0, 40, -20, 0], y: [0, -30, 20, 0], dur: 20 },
            { cls: "b2", x: [0, -30, 25, 0], y: [0, 25, -15, 0], dur: 26, delay: 3 },
            { cls: "b3", x: [0, 20, -40, 0], y: [0, -20, 30, 0], dur: 18, delay: 6 },
          ].map(b => (
            <motion.div key={b.cls} className={`blob ${b.cls}`}
              animate={{ x: b.x, y: b.y }}
              transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: b.delay }}
            />
          ))}
        </div>

        {/* Noise */}
        <div className="noise" aria-hidden />

        <div className="center">
          <motion.div className="card" variants={scaleIn} initial="hidden" animate="show">

            {/* Header */}
            <motion.div className="hdr" variants={fadeUp} custom={0} initial="hidden" animate="show">
              <div className="brand">
                <motion.div className="brand-icon"
                  whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
                >
                  <BookmarkIcon />
                </motion.div>
                <span className="brand-name">Smart Bookmark</span>
              </div>

              <MagneticButton className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
                <AnimatePresence mode="wait">
                  <motion.span key={darkMode ? "sun" : "moon"}
                    initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                    animate={{ rotate: 0, opacity: 1, scale: 1 }}
                    exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }} style={{ display: "flex" }}
                  >
                    {darkMode ? <SunIcon /> : <MoonIcon />}
                  </motion.span>
                </AnimatePresence>
                <span>{darkMode ? "Light" : "Dark"}</span>
              </MagneticButton>
            </motion.div>

            <motion.div className="divider" variants={fadeUp} custom={1} initial="hidden" animate="show" />

            {/* Login / App */}
            <AnimatePresence mode="wait">
              {!user ? (
                <motion.div key="login" className="login" variants={scaleIn} initial="hidden" animate="show" exit="exit">
                  <div className="rings">
                    {[90, 64, 44].map((size, i) => (
                      <motion.div key={size} className="ring" style={{ width: size, height: size }}
                        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                      />
                    ))}
                    <motion.div className="ring-core" whileHover={{ scale: 1.1, rotate: 5 }} transition={spring}>
                      <BookmarkIcon size={22} />
                    </motion.div>
                  </div>

                  <motion.h2 className="login-title" variants={fadeUp} custom={0} initial="hidden" animate="show">
                    Your bookmarks,<br /><em>elevated.</em>
                  </motion.h2>
                  <motion.p className="login-sub" variants={fadeUp} custom={1} initial="hidden" animate="show">
                    Save and access your favourite links from anywhere — beautifully.
                  </motion.p>
                  <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show">
                    <MagneticButton className="google-btn" onClick={loginWithGoogle}>
                      <GoogleIcon />
                      Continue with Google
                    </MagneticButton>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="app" variants={fadeUp} custom={0} initial="hidden" animate="show">

                  {/* User bar */}
                  <motion.div className="user-bar" variants={fadeUp} custom={0} initial="hidden" animate="show">
                    <motion.div className="avatar" whileHover={{ scale: 1.08 }} transition={spring}>
                      {user.email?.charAt(0).toUpperCase()}
                    </motion.div>
                    <span className="user-email">{user.email}</span>
                    <MagneticButton className="logout-btn" onClick={logout}>
                      <SignOutIcon /> Sign out
                    </MagneticButton>
                  </motion.div>

                  {/* Form */}
                  <motion.div className="form-block" variants={fadeUp} custom={1} initial="hidden" animate="show">
                    <div className="form-label">
                      <AnimatePresence mode="wait">
                        <motion.span key={editingId ? "e" : "a"}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}
                          style={{ display: "flex", alignItems: "center", gap: 6 }}
                        >
                          {editingId ? <><PenIcon /> Edit bookmark</> : <><PlusSmIcon /> New bookmark</>}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    <div className="fields">
                      <FieldInput icon={<TagIcon />} placeholder="Title" value={title} onChange={setTitle} onEnter={addOrUpdateBookmark} />
                      <FieldInput icon={<GlobeIcon />} placeholder="https://" value={url} onChange={setUrl} onEnter={addOrUpdateBookmark} />

                      <div className="form-row">
                        <MagneticButton
                          className={`btn-primary ${(!title || !url) ? "disabled" : ""}`}
                          onClick={addOrUpdateBookmark} disabled={!title || !url}
                        >
                          <AnimatePresence mode="wait">
                            <motion.span key={editingId ? "u" : "a"}
                              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                              style={{ display: "flex", alignItems: "center", gap: 7 }}
                            >
                              {editingId ? <><CheckIcon /> Update</> : <><PlusIcon /> Add Bookmark</>}
                            </motion.span>
                          </AnimatePresence>
                        </MagneticButton>

                        <AnimatePresence>
                          {editingId && (
                            <motion.button className="btn-cancel"
                              onClick={() => { setEditingId(null); setTitle(""); setUrl(""); }}
                              initial={{ opacity: 0, scale: 0.8, width: 0 }}
                              animate={{ opacity: 1, scale: 1, width: "auto" }}
                              exit={{ opacity: 0, scale: 0.8, width: 0 }}
                              transition={spring}
                            >
                              Cancel
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>

                  {/* Search */}
                  <motion.div className="search-row" variants={fadeUp} custom={2} initial="hidden" animate="show">
                    <span className="s-icon"><SearchIcon /></span>
                    <input className="search-input" type="text" placeholder="Search bookmarks..."
                      value={search} onChange={e => setSearch(e.target.value)} />
                    <AnimatePresence>
                      {search && (
                        <motion.button className="s-clear" onClick={() => setSearch("")}
                          initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }} transition={spring}
                        >
                          <XIcon />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* List */}
                  <LayoutGroup>
                    <motion.div className="bk-list" layout>
                      <AnimatePresence mode="popLayout">
                        {filtered.length === 0 ? (
                          <motion.div key="empty" className="empty"
                            variants={scaleIn} initial="hidden" animate="show" exit="exit"
                          >
                            <motion.div className="empty-icon"
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <BookmarkIcon size={28} />
                            </motion.div>
                            <p className="empty-t">{search ? "No matches found" : "No bookmarks yet"}</p>
                            <p className="empty-s">{search ? "Try a different term" : "Add your first bookmark above"}</p>
                          </motion.div>
                        ) : (
                          <>
                            <motion.div layout key="count" className="list-count"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                            >
                              {filtered.length} bookmark{filtered.length !== 1 ? "s" : ""}
                            </motion.div>
                            {filtered.map((bk, i) => (
                              <BookmarkRow
                                key={bk.id} bookmark={bk} index={i}
                                onEdit={() => { setEditingId(bk.id); setTitle(bk.title); setUrl(bk.url); }}
                                onDelete={() => deleteBookmark(bk.id)}
                              />
                            ))}
                          </>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </LayoutGroup>

                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Icons ────────────────────────────────────────────────────────
const BookmarkIcon = ({ size = 16 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);
const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
const SignOutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const TagIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const PenIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" />
  </svg>
);
const AlertIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const PlusSmIcon = () => <PlusIcon />;

// ─── CSS ──────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .light {
    --bg: #f4f1ed; --card: #fdfcfb; --card-b: rgba(0,0,0,0.055);
    --card-sh: 0 2px 4px rgba(0,0,0,0.03),0 12px 32px rgba(0,0,0,0.07),0 40px 80px rgba(0,0,0,0.04);
    --t1: #0d0c0b; --t2: #6a6560; --tm: #a09b97;
    --acc: #5242d4; --acc-h: #4232c4; --acc-glow: rgba(82,66,212,0.22);
    --div: rgba(0,0,0,0.07); --in-bg: #f7f4f0; --in-b: rgba(0,0,0,0.08);
    --it-bg: #f7f4f0; --it-hov: #eeebe6;
    --blob1: rgba(82,66,212,0.08); --blob2: rgba(168,85,247,0.06); --blob3: rgba(236,72,153,0.05);
    --edit-bg: rgba(234,179,8,0.1); --edit-c: #b45309; --edit-hov: rgba(234,179,8,0.18);
    --del-bg: rgba(239,68,68,0.08); --del-c: #dc2626; --del-hov: rgba(239,68,68,0.15);
    --del-conf-bg: rgba(220,38,38,0.9); --del-conf-c: #fff;
    --logout-bg: rgba(239,68,68,0.07); --logout-c: #dc2626;
    --theme-bg: rgba(0,0,0,0.05); --shimmer: var(--acc); --noise-op: 0.025; --ring-c: rgba(0,0,0,0.08);
  }
  .dark {
    --bg: #080810; --card: #100f1e; --card-b: rgba(255,255,255,0.045);
    --card-sh: 0 2px 4px rgba(0,0,0,0.4),0 12px 40px rgba(0,0,0,0.5),0 50px 100px rgba(0,0,0,0.4);
    --t1: #eae6ff; --t2: #8e8aad; --tm: #55516e;
    --acc: #7b6ff0; --acc-h: #9282f5; --acc-glow: rgba(123,111,240,0.28);
    --div: rgba(255,255,255,0.055); --in-bg: #19172e; --in-b: rgba(255,255,255,0.07);
    --it-bg: #16152a; --it-hov: #1e1c33;
    --blob1: rgba(123,111,240,0.14); --blob2: rgba(168,85,247,0.10); --blob3: rgba(236,72,153,0.07);
    --edit-bg: rgba(251,191,36,0.09); --edit-c: #fbbf24; --edit-hov: rgba(251,191,36,0.16);
    --del-bg: rgba(248,113,113,0.09); --del-c: #f87171; --del-hov: rgba(248,113,113,0.16);
    --del-conf-bg: rgba(239,68,68,0.9); --del-conf-c: #fff;
    --logout-bg: rgba(248,113,113,0.08); --logout-c: #f87171;
    --theme-bg: rgba(255,255,255,0.06); --shimmer: var(--acc); --noise-op: 0.04; --ring-c: rgba(255,255,255,0.08);
  }

  .root { min-height: 100vh; font-family: 'DM Sans', sans-serif; position: relative; overflow: hidden; }
  .center {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 48px 20px; position: relative; z-index: 2;
  }

  /* Noise */
  .noise {
    position: fixed; inset: 0; z-index: 1; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat; background-size: 120px;
    opacity: var(--noise-op); mix-blend-mode: overlay;
  }

  /* Blobs */
  .blobs { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
  .blob { position: absolute; border-radius: 50%; filter: blur(90px); will-change: transform; }
  .b1 { width: 560px; height: 560px; top: -180px; left: -120px; background: var(--blob1); }
  .b2 { width: 420px; height: 420px; bottom: -100px; right: -80px; background: var(--blob2); }
  .b3 { width: 300px; height: 300px; top: 55%; left: 58%; background: var(--blob3); }

  /* Card */
  .card {
    width: 100%; max-width: 560px; background: var(--card);
    border: 1px solid var(--card-b); border-radius: 26px;
    box-shadow: var(--card-sh); padding: 32px;
    position: relative; overflow: hidden;
  }
  .card::before {
    content: ''; position: absolute; inset: 0; border-radius: 26px;
    background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
    pointer-events: none;
  }

  /* Header */
  .hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-icon {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--acc), #a78bfa);
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    color: #fff; box-shadow: 0 4px 16px var(--acc-glow); cursor: default;
  }
  .brand-name { font-family: 'Instrument Serif', serif; font-size: 20px; letter-spacing: -0.01em; color: var(--t1); }
  .theme-btn {
    display: flex; align-items: center; gap: 7px; background: var(--theme-bg);
    border: 1px solid var(--div); color: var(--t2); padding: 8px 14px;
    border-radius: 100px; font-size: 12.5px; font-family: 'DM Sans', sans-serif; font-weight: 500;
    cursor: pointer; transition: color 0.2s; will-change: transform;
  }
  .theme-btn:hover { color: var(--t1); }

  .divider { height: 1px; background: var(--div); margin-bottom: 22px; }

  /* Login */
  .login { display: flex; flex-direction: column; align-items: center; padding: 16px 0 8px; }
  .rings {
    position: relative; width: 100px; height: 100px;
    display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
  }
  .ring { position: absolute; border-radius: 50%; border: 1px solid var(--ring-c); }
  .ring-core {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, var(--acc), #a78bfa);
    border-radius: 12px; display: flex; align-items: center; justify-content: center;
    color: #fff; position: relative; z-index: 1;
    box-shadow: 0 8px 28px var(--acc-glow); cursor: default;
  }
  .login-title {
    font-family: 'Instrument Serif', serif; font-size: 28px;
    letter-spacing: -0.025em; line-height: 1.2; color: var(--t1);
    text-align: center; margin-bottom: 10px;
  }
  .login-title em { font-style: italic; color: var(--acc); }
  .login-sub {
    font-size: 13.5px; color: var(--t2); text-align: center;
    line-height: 1.65; margin-bottom: 32px; max-width: 290px;
  }
  .google-btn {
    display: flex; align-items: center; gap: 10px; background: var(--card);
    border: 1px solid var(--card-b); color: var(--t1); padding: 13px 28px;
    border-radius: 14px; font-size: 14px;
    font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.06);
    transition: box-shadow 0.2s; will-change: transform;
  }
  .google-btn:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.06); }

  /* User bar */
  .user-bar {
    display: flex; align-items: center; gap: 10px;
    background: var(--in-bg); border: 1px solid var(--in-b);
    padding: 9px 13px; border-radius: 14px; margin-bottom: 22px;
  }
  .avatar {
    width: 28px; height: 28px;
    background: linear-gradient(135deg, var(--acc), #a78bfa);
    border-radius: 8px; font-size: 12px; font-weight: 600; color: #fff;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: default;
  }
  .user-email { font-size: 13px; color: var(--t2); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .logout-btn {
    display: flex; align-items: center; gap: 5px; background: var(--logout-bg); border: none;
    color: var(--logout-c); padding: 5px 10px; border-radius: 8px;
    font-size: 12px; font-family: 'DM Sans', sans-serif; font-weight: 500;
    cursor: pointer; transition: opacity 0.2s; will-change: transform; flex-shrink: 0;
  }
  .logout-btn:hover { opacity: 0.8; }

  /* Form */
  .form-block { margin-bottom: 18px; }
  .form-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--tm); margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .fields { display: flex; flex-direction: column; gap: 9px; }
  .field-wrap { position: relative; display: flex; align-items: center; will-change: transform; }
  .f-icon { position: absolute; left: 14px; color: var(--tm); display: flex; pointer-events: none; transition: color 0.2s; z-index: 1; }
  .f-icon.active { color: var(--acc); }
  .field {
    width: 100%; background: var(--in-bg); border: 1px solid var(--in-b);
    color: var(--t1); padding: 12px 14px 12px 38px; border-radius: 12px;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s; position: relative; z-index: 1;
  }
  .field::placeholder { color: var(--tm); }
  .field:focus { border-color: var(--acc); box-shadow: 0 0 0 3px var(--acc-glow); }
  .field-glow {
    position: absolute; inset: -1px; border-radius: 13px;
    border: 1px solid var(--acc); box-shadow: 0 0 16px var(--acc-glow);
    pointer-events: none; z-index: 0;
  }
  .form-row { display: flex; gap: 8px; }
  .btn-primary {
    flex: 1; display: flex; align-items: center; justify-content: center;
    gap: 7px; background: var(--acc); color: #fff; border: none;
    padding: 12px 20px; border-radius: 12px; font-size: 14px;
    font-family: 'DM Sans', sans-serif; font-weight: 500; cursor: pointer;
    box-shadow: 0 4px 16px var(--acc-glow);
    transition: background 0.2s, box-shadow 0.2s, opacity 0.2s; will-change: transform;
  }
  .btn-primary:hover:not(.disabled) { background: var(--acc-h); box-shadow: 0 6px 24px var(--acc-glow); }
  .btn-primary.disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
  .btn-cancel {
    background: var(--in-bg); border: 1px solid var(--in-b); color: var(--t2);
    padding: 12px 16px; border-radius: 12px; font-size: 13px;
    font-family: 'DM Sans', sans-serif; cursor: pointer; overflow: hidden; white-space: nowrap;
    transition: background 0.2s;
  }
  .btn-cancel:hover { background: var(--it-hov); }

  /* Search */
  .search-row { position: relative; display: flex; align-items: center; margin-bottom: 16px; }
  .s-icon { position: absolute; left: 14px; color: var(--tm); display: flex; pointer-events: none; }
  .search-input {
    width: 100%; background: var(--in-bg); border: 1px solid var(--in-b);
    color: var(--t1); padding: 12px 40px; border-radius: 12px;
    font-size: 14px; font-family: 'DM Sans', sans-serif;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input::placeholder { color: var(--tm); }
  .search-input:focus { border-color: var(--acc); box-shadow: 0 0 0 3px var(--acc-glow); }
  .s-clear {
    position: absolute; right: 12px; background: var(--it-bg); border: none;
    color: var(--tm); cursor: pointer; display: flex; padding: 4px; border-radius: 6px;
    transition: color 0.2s, background 0.2s; will-change: transform;
  }
  .s-clear:hover { color: var(--t1); background: var(--it-hov); }

  /* Bookmark list */
  .bk-list { display: flex; flex-direction: column; gap: 5px; }
  .list-count {
    font-size: 11px; font-weight: 600; letter-spacing: 0.07em;
    text-transform: uppercase; color: var(--tm); margin-bottom: 4px; padding: 0 2px;
  }
  .bk-item {
    position: relative; display: flex; align-items: center; gap: 12px;
    background: var(--it-bg); border: 1px solid rgba(255,255,255,0.03);
    padding: 13px 14px; border-radius: 14px; overflow: hidden;
    cursor: default; transition: background 0.2s; will-change: transform;
  }
  .bk-item:hover { background: var(--it-hov); }
  .bk-shimmer {
    position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, var(--shimmer), transparent);
    transform-origin: left;
  }
  .bk-fav {
    width: 30px; height: 30px; border-radius: 8px; background: var(--div);
    display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;
  }
  .bk-fav img { width: 18px; height: 18px; object-fit: contain; }
  .bk-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .bk-title {
    font-size: 13.5px; font-weight: 500; color: var(--t1); text-decoration: none;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.2s;
  }
  .bk-title:hover { color: var(--acc); }
  .bk-domain { font-size: 11.5px; color: var(--tm); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .bk-actions { display: flex; gap: 5px; flex-shrink: 0; }
  .icon-btn {
    width: 30px; height: 30px; border: none; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s; will-change: transform;
  }
  .edit-btn { background: var(--edit-bg); color: var(--edit-c); }
  .edit-btn:hover { background: var(--edit-hov); }
  .del-btn { background: var(--del-bg); color: var(--del-c); }
  .del-btn:hover { background: var(--del-hov); }
  .del-btn.confirm { background: var(--del-conf-bg) !important; color: var(--del-conf-c) !important; }

  /* Empty */
  .empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 44px 0; }
  .empty-icon {
    width: 58px; height: 58px; background: var(--it-bg); border-radius: 16px;
    display: flex; align-items: center; justify-content: center; color: var(--tm); margin-bottom: 10px;
  }
  .empty-t { font-size: 15px; font-weight: 500; color: var(--t2); }
  .empty-s { font-size: 13px; color: var(--tm); }

  /* Loader */
  .loader-screen { position: fixed; inset: 0; background: #080810; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .loader-dot { width: 8px; height: 8px; border-radius: 50%; background: #7b6ff0; }

  @media (max-width: 480px) {
    .card { padding: 24px 18px; border-radius: 20px; }
    .brand-name { font-size: 17px; }
    .theme-btn span:last-child { display: none; }
  }
`;