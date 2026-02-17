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
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        Loading...
      </div>
    );

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex justify-center items-center px-4 py-10 bg-gray-100 dark:bg-gray-900 transition-colors duration-500">

        <Toaster position="top-right" />

        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl shadow-2xl p-10 transition-all duration-500">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold">
              🚀 Smart Bookmark
            </h1>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-full text-sm transition"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          {!user ? (
            <div className="text-center">
              <button
                onClick={loginWithGoogle}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full transition"
              >
                Login with Google
              </button>
            </div>
          ) : (
            <>
              {/* Welcome */}
              <div className="flex justify-between items-center mb-6">
                <p>
                  Welcome,{" "}
                  <span className="font-semibold">{user.email}</span>
                </p>

                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-sm transition"
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
                  className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-xl outline-none transition"
                />

                <input
                  type="text"
                  placeholder="Bookmark URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-xl outline-none transition"
                />

                <button
                  onClick={addOrUpdateBookmark}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl transition"
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
                className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 rounded-xl mb-6 outline-none transition"
              />

              {/* List */}
              <div className="space-y-4">
                {filteredBookmarks.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    No bookmarks found.
                  </p>
                ) : (
                  filteredBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="flex justify-between items-center bg-gray-200 dark:bg-gray-700 px-5 py-4 rounded-xl transition"
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
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full text-sm"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteBookmark(bookmark.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm"
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
