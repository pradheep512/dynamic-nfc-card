"use client";

import { useEffect, useState } from "react";
import { createClient, User } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const defaultOptions = [
  { name: "LinkedIn", type: "linkedin", icon: "💼" },
  { name: "GitHub", type: "github", icon: "💻" },
  { name: "Resume", type: "resume", icon: "📄" },
  { name: "Portfolio", type: "portfolio", icon: "🌐" },
  { name: "Letterboxd", type: "letterboxd", icon: "🎬" },
  { name: "Goodreads", type: "goodreads", icon: "📚" },
  { name: "Spotify", type: "spotify", icon: "🎵" },
];

type SavedLink = {
  id: number;
  user_id: string;
  name: string;
  type: string;
  url: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [tagId, setTagId] = useState("");
  const [activeMode, setActiveMode] = useState("");
  const [activeDestination, setActiveDestination] = useState("");

  const [links, setLinks] = useState<SavedLink[]>([]);

  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingUrl, setEditingUrl] = useState("");

  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      // Find logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUser(user);

      // Find this user's card
      const { data: tag, error: tagError } = await supabase
        .from("tags")
        .select("tag_id, mode, destination")
        .eq("user_id", user.id)
        .single();

      if (tagError || !tag) {
        console.error(tagError);
        setMessage("No card is linked to your account.");
        setLoading(false);
        return;
      }

      setTagId(tag.tag_id);
      setActiveMode(tag.mode || "");
      setActiveDestination(tag.destination || "");

      // Load user's saved links
      const { data: savedLinks, error: linksError } = await supabase
        .from("saved_links")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (linksError) {
        console.error(linksError);
        setMessage("Could not load your saved links.");
      } else {
        setLinks(savedLinks || []);
      }

      setLoading(false);
    }

    loadDashboard();
  }, []);

  function getSavedLink(type: string) {
    return links.find(
      (link) => link.type === type && !link.type.startsWith("custom_")
    );
  }

  function startEditing(
    type: string,
    name: string,
    currentUrl: string = ""
  ) {
    setEditingType(type);
    setEditingName(name);
    setEditingUrl(currentUrl);
    setMessage("");
  }

  async function saveDefaultLink() {
    if (!user || !editingType || !editingUrl.trim()) {
      setMessage("Please enter a URL.");
      return;
    }

    const existing = links.find(
      (link) => link.type === editingType
    );

    if (existing) {
      // Update existing saved URL
      const { data, error } = await supabase
        .from("saved_links")
        .update({
          url: editingUrl.trim(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error(error);
        setMessage("Could not save link.");
        return;
      }

      setLinks((current) =>
        current.map((link) =>
          link.id === existing.id ? data : link
        )
      );
    } else {
      // Create saved URL for first time
      const { data, error } = await supabase
        .from("saved_links")
        .insert({
          user_id: user.id,
          name: editingName,
          type: editingType,
          url: editingUrl.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error(error);
        setMessage("Could not save link.");
        return;
      }

      setLinks((current) => [...current, data]);
    }

    setEditingType(null);
    setEditingUrl("");
    setMessage("✓ Link saved.");
  }

  async function activateLink(link: SavedLink) {
    if (!tagId) return;

    setMessage("Activating...");

    const { error } = await supabase
      .from("tags")
      .update({
        mode: link.type,
        destination: link.url,
      })
      .eq("tag_id", tagId);

    if (error) {
      console.error(error);
      setMessage("Could not activate this link.");
      return;
    }

    setActiveMode(link.type);
    setActiveDestination(link.url);
    setMessage(`✓ ${link.name} is now active.`);
  }

  async function addCustomLink() {
    if (!user) return;

    if (!customName.trim() || !customUrl.trim()) {
      setMessage("Enter a name and URL for your custom link.");
      return;
    }

    // Unique type for each custom link
    const customType =
      "custom_" +
      Date.now().toString();

    const { data, error } = await supabase
      .from("saved_links")
      .insert({
        user_id: user.id,
        name: customName.trim(),
        type: customType,
        url: customUrl.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      setMessage("Could not add custom link.");
      return;
    }

    setLinks((current) => [...current, data]);

    setCustomName("");
    setCustomUrl("");

    setMessage("✓ Custom link added.");
  }

  async function deleteCustomLink(link: SavedLink) {
    const { error } = await supabase
      .from("saved_links")
      .delete()
      .eq("id", link.id);

    if (error) {
      console.error(error);
      setMessage("Could not delete link.");
      return;
    }

    setLinks((current) =>
      current.filter((item) => item.id !== link.id)
    );

    setMessage("Link deleted.");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const customLinks = links.filter((link) =>
    link.type.startsWith("custom_")
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
        color: "#111",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "4px" }}>
              Just Tap
            </h1>

            <p
              style={{
                color: "#666",
                margin: 0,
              }}
            >
              One card. Whatever you need.
            </p>
          </div>

          <button
            onClick={logout}
            style={{
              padding: "9px 14px",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "9px",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* ACTIVE CARD */}

            <section
              style={{
                background: "#111",
                color: "white",
                padding: "28px",
                borderRadius: "20px",
                marginBottom: "25px",
              }}
            >
              <small
                style={{
                  opacity: 0.6,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Your card is currently opening
              </small>

              <h2
                style={{
                  marginBottom: "8px",
                }}
              >
                {activeMode
                  ? links.find(
                      (link) => link.type === activeMode
                    )?.name || activeMode
                  : "Nothing yet"}
              </h2>

              <p
                style={{
                  margin: 0,
                  opacity: 0.7,
                  wordBreak: "break-word",
                }}
              >
                {activeDestination ||
                  "Choose a link below."}
              </p>
            </section>

            {/* DEFAULT OPTIONS */}

            <section
              style={{
                background: "white",
                padding: "28px",
                borderRadius: "20px",
                marginBottom: "25px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                My Links
              </h2>

              <p style={{ color: "#666" }}>
                Save each link once, then switch your card
                whenever you want.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "25px",
                }}
              >
                {defaultOptions.map((option) => {
                  const saved = getSavedLink(option.type);
                  const active =
                    activeMode === option.type;

                  return (
                    <div
                      key={option.type}
                      style={{
                        padding: "18px",
                        border: active
                          ? "2px solid black"
                          : "1px solid #e5e5e5",
                        borderRadius: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "center",
                          gap: "15px",
                        }}
                      >
                        <div>
                          <strong>
                            {option.icon} {option.name}
                          </strong>

                          <div
                            style={{
                              color: "#777",
                              fontSize: "13px",
                              marginTop: "5px",
                              wordBreak: "break-word",
                            }}
                          >
                            {saved
                              ? saved.url
                              : "Not set up"}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "7px",
                          }}
                        >
                          <button
                            onClick={() =>
                              startEditing(
                                option.type,
                                option.name,
                                saved?.url || ""
                              )
                            }
                            style={smallButton}
                          >
                            {saved ? "Edit" : "Set up"}
                          </button>

                          {saved && (
                            <button
                              onClick={() =>
                                activateLink(saved)
                              }
                              disabled={active}
                              style={{
                                ...smallButton,
                                background: active
                                  ? "#ddd"
                                  : "#111",
                                color: active
                                  ? "#666"
                                  : "white",
                              }}
                            >
                              {active
                                ? "Active"
                                : "Activate"}
                            </button>
                          )}
                        </div>
                      </div>

                      {editingType === option.type && (
                        <div
                          style={{
                            marginTop: "15px",
                          }}
                        >
                          <input
                            type="url"
                            value={editingUrl}
                            onChange={(e) =>
                              setEditingUrl(
                                e.target.value
                              )
                            }
                            placeholder="https://..."
                            style={inputStyle}
                          />

                          <button
                            onClick={saveDefaultLink}
                            style={{
                              ...mainButton,
                              marginTop: "10px",
                            }}
                          >
                            Save {option.name}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* CUSTOM LINKS */}

            <section
              style={{
                background: "white",
                padding: "28px",
                borderRadius: "20px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>
                Custom Links
              </h2>

              <p style={{ color: "#666" }}>
                Add anything else you want your card to
                open.
              </p>

              {customLinks.map((link) => {
                const active =
                  activeMode === link.type;

                return (
                  <div
                    key={link.id}
                    style={{
                      border: active
                        ? "2px solid black"
                        : "1px solid #e5e5e5",
                      borderRadius: "14px",
                      padding: "18px",
                      marginTop: "12px",
                    }}
                  >
                    <strong>🔗 {link.name}</strong>

                    <p
                      style={{
                        color: "#777",
                        fontSize: "13px",
                        wordBreak: "break-word",
                      }}
                    >
                      {link.url}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() =>
                          activateLink(link)
                        }
                        disabled={active}
                        style={{
                          ...smallButton,
                          background: active
                            ? "#ddd"
                            : "#111",
                          color: active
                            ? "#666"
                            : "white",
                        }}
                      >
                        {active
                          ? "Active"
                          : "Activate"}
                      </button>

                      <button
                        onClick={() =>
                          deleteCustomLink(link)
                        }
                        style={smallButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ADD CUSTOM */}

              <div
                style={{
                  marginTop: "25px",
                  paddingTop: "25px",
                  borderTop: "1px solid #eee",
                }}
              >
                <h3>Add a custom link</h3>

                <input
                  type="text"
                  value={customName}
                  onChange={(e) =>
                    setCustomName(e.target.value)
                  }
                  placeholder="Name — e.g. Instagram"
                  style={inputStyle}
                />

                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) =>
                    setCustomUrl(e.target.value)
                  }
                  placeholder="https://..."
                  style={{
                    ...inputStyle,
                    marginTop: "10px",
                  }}
                />

                <button
                  onClick={addCustomLink}
                  style={{
                    ...mainButton,
                    marginTop: "10px",
                  }}
                >
                  + Add Custom Link
                </button>
              </div>
            </section>

            {message && (
              <p
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                }}
              >
                {message}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "13px",
  border: "1px solid #ccc",
  borderRadius: "9px",
  fontSize: "15px",
};

const smallButton = {
  padding: "8px 12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  background: "white",
  cursor: "pointer",
};

const mainButton = {
  width: "100%",
  padding: "13px",
  border: "none",
  borderRadius: "9px",
  background: "#111",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};