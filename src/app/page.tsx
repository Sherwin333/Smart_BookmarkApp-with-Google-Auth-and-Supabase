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

  const theme = darkMode
    ? "bg-gray-900 text-white"
    : "bg-gray-50 text-gray-900";

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  return (
    <div className={`min-h-screen flex justify-center px-4 py-10 ${theme}`}>
      <Toaster position="top-right" />

      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 dark:text-white rounded-2xl shadow-xl p-8 transition-all">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            🔖 Smart Bookmark App
          </h1>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-sm bg-gray-700 text-white px-4 py-1 rounded-lg"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {!user ? (
          <button
            onClick={loginWithGoogle}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
          >
            Login with Google
          </button>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p>
                Welcome,{" "}
                <span className="font-semibold">{user.email}</span>
              </p>
              <button
                onClick={logout}
                className="text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg transition"
              >
                Logout
              </button>
            </div>

            {/* Add / Edit Form */}
            <div className="space-y-3 mb-6">
              <input
  type="text"
  placeholder="Bookmark Title"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  className="w-full border border-gray-300 dark:border-gray-600 
             bg-white dark:bg-gray-700 
             text-gray-900 dark:text-white
             rounded-lg px-4 py-2 
             focus:ring-2 focus:ring-blue-400 outline-none"
/>

              <input
  type="text"
  placeholder="Bookmark URL"
  value={url}
  onChange={(e) => setUrl(e.target.value)}
  className="w-full border border-gray-300 dark:border-gray-600 
             bg-white dark:bg-gray-700 
             text-gray-900 dark:text-white
             rounded-lg px-4 py-2 
             focus:ring-2 focus:ring-blue-400 outline-none"
/>


              <button
                onClick={addOrUpdateBookmark}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition"
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
  className="w-full border border-gray-300 dark:border-gray-600 
             bg-white dark:bg-gray-700 
             text-gray-900 dark:text-white
             rounded-lg px-4 py-2 mb-6 
             focus:ring-2 focus:ring-blue-400 outline-none"
/>


            {/* List */}
            <div className="space-y-3">
              {filteredBookmarks.length === 0 ? (
                <p>No bookmarks found.</p>
              ) : (
                filteredBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg"
                  >
                    <a
                      href={bookmark.url}
                      target="_blank"
                      className="text-blue-600 hover:underline"
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
                        className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteBookmark(bookmark.id)
                        }
                        className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
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
  );
}
