"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);

    if (data.user) {
      fetchBookmarks(data.user.id);
    }

    setLoading(false);
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
    });
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setBookmarks([]);
  }

  async function addBookmark() {
    if (!user || !title || !url) return;

    const { error } = await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: user.id,
    });

    if (!error) {
      setTitle("");
      setUrl("");
      fetchBookmarks(user.id);
    } else {
      console.error(error.message);
    }
  }

  async function deleteBookmark(id: string) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id);

    if (!error && user) {
      fetchBookmarks(user.id);
    } else {
      console.error(error?.message);
    }
  }

  async function fetchBookmarks(userId: string) {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookmarks(data);
    }
  }

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <main
      style={{
        maxWidth: "600px",
        margin: "60px auto",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>🔖 Smart Bookmark App</h1>

      {!user ? (
        <button
          onClick={loginWithGoogle}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#4285F4",
            color: "white",
            cursor: "pointer",
          }}
        >
          Login with Google
        </button>
      ) : (
        <>
          <div style={{ marginBottom: "15px" }}>
            <p>Welcome, <strong>{user.email}</strong></p>
            <button
              onClick={logout}
              style={{
                backgroundColor: "#555",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>

          <hr style={{ margin: "20px 0" }} />

          <h3>Add Bookmark</h3>

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <input
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={addBookmark}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#2ecc71",
              color: "white",
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            Add Bookmark
          </button>

          <hr style={{ margin: "20px 0" }} />

          <h3>Your Bookmarks</h3>

          {bookmarks.length === 0 && <p>No bookmarks yet.</p>}

          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                padding: "10px",
                border: "1px solid #eee",
                borderRadius: "6px",
              }}
            >
              <a
                href={bookmark.url}
                target="_blank"
                style={{ textDecoration: "none", color: "#333" }}
              >
                {bookmark.title}
              </a>

              <button
                onClick={() => deleteBookmark(bookmark.id)}
                style={{
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </>
      )}
    </main>
  );
}
