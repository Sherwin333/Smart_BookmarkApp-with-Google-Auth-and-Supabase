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
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    if (data.user) fetchBookmarks(data.user.id);
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
      await supabase
        .from("bookmarks")
        .update({ title, url })
        .eq("id", editingId);
      toast.success("Bookmark updated");
      setEditingId(null);
    } else {
      await supabase.from("bookmarks").insert({
        title,
        url,
        user_id: user.id,
      });
      toast.success("Bookmark added");
    }

    setTitle("");
    setUrl("");
    fetchBookmarks(user.id);
  }

  async function deleteBookmark(id: string) {
    await supabase.from("bookmarks").delete().eq("id", id);
    toast.success("Bookmark deleted");
    if (user) fetchBookmarks(user.id);
  }

  async function fetchBookmarks(userId: string) {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setBookmarks(data);
  }

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-white bg-gray-900">
        Loading...
      </div>
    );

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-black flex justify-center items-center px-4 py-10 transition-all">

        <Toaster position="top-right" />

        <div className="w-full max-w-2xl backdrop-blur-xl bg-white/30 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700 rounded-3xl shadow-2xl p-10 text-white dark:text-white transition-all">

          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight">
              🚀 Smart Bookmark
            </h1>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full text-sm backdrop-blur transition"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          {!user ? (
            <div className="text-center">
              <button
                onClick={loginWithGoogle}
                className="bg-white text-gray-800 font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Login with Google
              </button>
            </div>
          ) : (
            <>
              {/* Welcome */}
              <div className="flex justify-between items-center mb-6">
                <p className="font-medium">
                  Welcome,{" "}
                  <span className="font-bold">{user.email}</span>
                </p>

                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-full text-sm transition"
                >
                  Logout
                </button>
              </div>

              {/* Add / Edit */}
              <div className="space-y-4 mb-8">
                <input
                  type="text"
                  placeholder="Bookmark Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/40 dark:bg-gray-700/70 text-white placeholder-gray-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-white transition"
                />

                <input
                  type="text"
                  placeholder="Bookmark URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-white/40 dark:bg-gray-700/70 text-white placeholder-gray-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-white transition"
                />

                <button
                  onClick={addOrUpdateBookmark}
                  className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold transition-transform hover:scale-105"
                >
                  {editingId ? "Update Bookmark" : "Add Bookmark"}
                </button>
              </div>

              {/* Search */}
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/40 dark:bg-gray-700/70 text-white placeholder-gray-200 px-4 py-3 rounded-xl mb-6 outline-none focus:ring-2 focus:ring-white transition"
              />

              {/* List */}
              <div className="space-y-4">
                {filteredBookmarks.length === 0 ? (
                  <p className="text-center text-gray-200">
                    No bookmarks found.
                  </p>
                ) : (
                  filteredBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="flex justify-between items-center bg-white/30 dark:bg-gray-700/70 px-5 py-4 rounded-xl backdrop-blur hover:scale-[1.02] transition-transform"
                    >
                      <a
                        href={bookmark.url}
                        target="_blank"
                        className="font-medium hover:underline"
                      >
                        {bookmark.title}
                      </a>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(bookmark.id);
                            setTitle(bookmark.title);
                            setUrl(bookmark.url);
                          }}
                          className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-full text-sm transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteBookmark(bookmark.id)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full text-sm transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
