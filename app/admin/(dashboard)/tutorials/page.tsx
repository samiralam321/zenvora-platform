"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Youtube,
  Plus,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Search,
  X,
  ListVideo,
  Layers,
  CheckSquare,
  Square,
  ArrowRight,
  Folder,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Tv,
  Film,
} from "lucide-react";
import SyncButton from "@/components/admin/SyncButton";

interface DomainItem {
  id: string;
  name: string;
  slug: string;
}

interface PlaylistItem {
  id: string;
  title: string;
  slug: string;
  channelName?: string | null;
  categoryId?: string | null;
  category?: DomainItem | null;
  thumbnail?: string | null;
  _count?: { videos: number };
}

interface VideoPreviewItem {
  youtubeId: string;
  title: string;
  thumbnail: string;
  duration?: string | null;
  authorName?: string;
  selected?: boolean;
}

export default function AdminTutorialsPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<DomainItem[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [selectedDomainId, setSelectedDomainId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Playlist Mode & Details in Importer
  const [targetPlaylistChoice, setTargetPlaylistChoice] = useState<string>("new"); // "new", "none", or existing playlist ID
  const [playlistTitleInput, setPlaylistTitleInput] = useState<string>("");
  const [channelNameInput, setChannelNameInput] = useState<string>("");
  const [youtubePlaylistId, setYoutubePlaylistId] = useState<string | null>(null);

  // Link input state
  const [urlInput, setUrlInput] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [previewVideos, setPreviewVideos] = useState<VideoPreviewItem[]>([]);
  const [savingBatch, setSavingBatch] = useState(false);
  const [featureFirst, setFeatureFirst] = useState(true);

  // Accordion state for playlist groups in table
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

  // Quick Add Domain Modal state
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [domainForm, setDomainForm] = useState({
    name: "",
    slug: "",
    icon: "Code2",
    description: "",
  });
  const [domainError, setDomainError] = useState<string | null>(null);
  const [savingDomain, setSavingDomain] = useState(false);

  // Edit Video Modal state
  const [editingVideo, setEditingVideo] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  // Edit Playlist Modal state
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistItem | null>(null);
  const [savingPlaylistEdit, setSavingPlaylistEdit] = useState(false);

  // Filter table by domain
  const [filterDomainId, setFilterDomainId] = useState<string>("all");

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/tutorials");
      const data = await res.json();
      if (data.videos) setVideos(data.videos);
      if (data.categories) {
        setCategories(data.categories);
        if (!selectedDomainId && data.categories.length > 0) {
          setSelectedDomainId(data.categories[0].id);
        }
      }
      if (data.playlists) {
        setPlaylists(data.playlists);
        // Expand all playlist groups by default
        const exp: { [key: string]: boolean } = { standalone: true };
        data.playlists.forEach((p: PlaylistItem) => {
          exp[p.id] = true;
        });
        setExpandedGroups((prev) => ({ ...exp, ...prev }));
      }
      setLoading(false);
    } catch (e) {
      setError("Failed to load curriculum data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter playlists available under currently selected target domain
  const domainPlaylists = playlists.filter((p) => p.categoryId === selectedDomainId);

  const currentDomain = categories.find((c) => c.id === selectedDomainId);
  const currentDomainName = currentDomain?.name || "Selected Domain";

  const handleFetchPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setPreviewing(true);
    setError(null);
    setPreviewVideos([]);

    try {
      const res = await fetch("/api/admin/youtube/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to preview YouTube content");

      if (data.isPlaylist && Array.isArray(data.videos)) {
        setIsPlaylist(true);
        setYoutubePlaylistId(data.youtubePlaylistId || null);
        if (!playlistTitleInput) {
          setPlaylistTitleInput(data.playlistTitle || "Curated Course Series");
        }
        if (!channelNameInput && data.channelName) {
          setChannelNameInput(data.channelName);
        }
        setPreviewVideos(data.videos.map((v: any) => ({ ...v, selected: true })));
      } else if (data.videos && data.videos.length > 0) {
        setIsPlaylist(data.videos.length > 1);
        if (data.videos.length > 1 && !playlistTitleInput) {
          setPlaylistTitleInput(data.playlistTitle || "Curated Series");
        }
        if (!channelNameInput && data.channelName) {
          setChannelNameInput(data.channelName);
        }
        setPreviewVideos(data.videos.map((v: any) => ({ ...v, selected: true })));
      } else {
        throw new Error("No videos found from the provided link.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch YouTube link. Check URL format.");
    } finally {
      setPreviewing(false);
    }
  };

  const toggleSelectVideo = (youtubeId: string) => {
    setPreviewVideos((prev) =>
      prev.map((v) => (v.youtubeId === youtubeId ? { ...v, selected: !v.selected } : v))
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setPreviewVideos((prev) => prev.map((v) => ({ ...v, selected: select })));
  };

  const updatePreviewTitle = (youtubeId: string, newTitle: string) => {
    setPreviewVideos((prev) =>
      prev.map((v) => (v.youtubeId === youtubeId ? { ...v, title: newTitle } : v))
    );
  };

  const selectedCount = previewVideos.filter((v) => v.selected).length;

  const handleSaveToDomain = async () => {
    const chosenVideos = previewVideos.filter((v) => v.selected);
    if (chosenVideos.length === 0) return;

    setSavingBatch(true);
    setError(null);

    try {
      const payload: any = {
        categoryId: selectedDomainId,
        videos: chosenVideos,
        featureFirst,
        channelName: channelNameInput.trim() || undefined,
        youtubePlaylistId,
      };

      if (targetPlaylistChoice === "new") {
        payload.playlistTitle = playlistTitleInput.trim() || "Course Series";
      } else if (targetPlaylistChoice !== "none") {
        payload.playlistId = targetPlaylistChoice;
      } else {
        payload.playlistId = "none";
      }

      const res = await fetch("/api/admin/tutorials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save curriculum lectures");

      const targetTitle =
        targetPlaylistChoice === "new"
          ? playlistTitleInput || "New Playlist"
          : targetPlaylistChoice !== "none"
          ? domainPlaylists.find((p) => p.id === targetPlaylistChoice)?.title || "Playlist"
          : "Domain";

      setMessage(
        `Successfully saved ${chosenVideos.length} lecture(s) into [${currentDomainName}] > [${targetTitle}]!`
      );
      setUrlInput("");
      setPreviewVideos([]);
      setIsPlaylist(false);
      setPlaylistTitleInput("");
      setChannelNameInput("");
      setYoutubePlaylistId(null);
      fetchData();
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to save lectures to database");
    } finally {
      setSavingBatch(false);
    }
  };

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainForm.name.trim() || !domainForm.slug.trim()) return;

    setSavingDomain(true);
    setDomainError(null);
    try {
      const res = await fetch("/api/admin/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: domainForm.name.trim(),
          slug: domainForm.slug.trim(),
          icon: domainForm.icon,
          description: domainForm.description.trim(),
          order: categories.length + 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create domain");

      const refreshed = await fetch("/api/admin/tutorials");
      const refData = await refreshed.json();
      if (refData.categories) {
        setCategories(refData.categories);
        setSelectedDomainId(data.domain.id);
      }

      setMessage(`Domain "${data.domain.name}" created and selected!`);
      setDomainModalOpen(false);
      setDomainForm({ name: "", slug: "", icon: "Code2", description: "" });
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setDomainError(err.message || "Failed to create domain");
    } finally {
      setSavingDomain(false);
    }
  };

  const handleToggleFeatured = async (v: any) => {
    try {
      await fetch("/api/admin/tutorials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, featured: !v.featured }),
      });
      fetchData();
    } catch (e) {}
  };

  const handleToggleVisible = async (v: any) => {
    try {
      await fetch("/api/admin/tutorials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...v, visible: !v.visible }),
      });
      fetchData();
    } catch (e) {}
  };

  const handleDeleteVideo = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove lecture: "${title}"?`)) return;
    try {
      await fetch(`/api/admin/tutorials?id=${id}`, { method: "DELETE" });
      fetchData();
      setMessage("Lecture deleted");
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {}
  };

  const handleDeletePlaylist = async (id: string, title: string) => {
    if (
      !confirm(
        `Are you sure you want to remove the entire course playlist: "${title}"?\nAll associated lectures in this playlist will also be removed.`
      )
    ) {
      return;
    }
    try {
      await fetch(`/api/admin/tutorials?playlistId=${id}`, { method: "DELETE" });
      fetchData();
      setMessage(`Course playlist "${title}" and its lectures deleted.`);
      setTimeout(() => setMessage(null), 3500);
    } catch (e) {}
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    setUpdating(true);

    try {
      const res = await fetch("/api/admin/tutorials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingVideo),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setMessage("Lecture updated!");
      setEditingVideo(null);
      fetchData();
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleSavePlaylistEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaylist) return;
    setSavingPlaylistEdit(true);

    try {
      const res = await fetch("/api/admin/playlists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPlaylist),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Playlist update failed");

      setMessage("Course playlist updated!");
      setEditingPlaylist(null);
      fetchData();
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setError(err.message || "Playlist update failed");
    } finally {
      setSavingPlaylistEdit(false);
    }
  };

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Group videos for the management view:
  // First, filter by domain filter
  const displayedVideos =
    filterDomainId === "all"
      ? videos
      : videos.filter((v) => v.categoryId === filterDomainId);

  const displayedPlaylists =
    filterDomainId === "all"
      ? playlists
      : playlists.filter((p) => p.categoryId === filterDomainId);

  // Group videos by playlist ID
  const playlistGroups = displayedPlaylists.map((p) => {
    const pVideos = displayedVideos.filter((v) => v.playlistId === p.id);
    return {
      playlist: p,
      videos: pVideos,
    };
  });

  const standaloneVideos = displayedVideos.filter((v) => !v.playlistId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1D64EC] text-xs font-bold mb-2 uppercase tracking-wider">
            <ListVideo className="w-3.5 h-3.5" />
            <span>Channel Playlist &amp; Lecture Organizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Lectures &amp; Course Tracks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Choose a domain (e.g. DSA, Web Dev), import entire channel playlists separately so
            lectures are never mixed together, or add individual lectures.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <SyncButton />
          <Link
            href="/"
            target="_blank"
            className="border border-slate-200 hover:border-slate-300 bg-white text-slate-800 text-xs font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
          >
            <span>View on Main Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            Open Home Page &rarr;
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between animate-in fade-in">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs text-rose-600 font-bold ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Importer Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-7 space-y-6">
        {/* Step 1: Target Learning Domain */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#1D64EC] text-white text-[11px] flex items-center justify-center font-bold">
                1
              </span>
              <span>Target Learning Domain</span>
            </label>

            <button
              id="open-add-domain-modal"
              type="button"
              onClick={() => {
                setDomainError(null);
                setDomainModalOpen(true);
              }}
              className="text-xs font-bold text-[#1D64EC] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Domain</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              id="target-domain-select"
              value={selectedDomainId}
              onChange={(e) => {
                setSelectedDomainId(e.target.value);
                setTargetPlaylistChoice("new");
              }}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm font-semibold bg-white focus:outline-none focus:border-[#1D64EC] focus:ring-1 focus:ring-[#1D64EC]"
            >
              {categories.map((c) => {
                const count = videos.filter((v) => v.categoryId === c.id).length;
                const pCount = playlists.filter((p) => p.categoryId === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({count} lectures • {pCount} playlists)
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={() => {
                setDomainError(null);
                setDomainModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 text-xs font-semibold shrink-0 transition"
            >
              + Create Track
            </button>
          </div>
        </div>

        {/* Step 2: Course / Playlist Organization in Domain */}
        <div className="pt-4 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
            <span className="w-5 h-5 rounded-full bg-[#1D64EC] text-white text-[11px] flex items-center justify-center font-bold">
              2
            </span>
            <span>Channel &amp; Course Playlist Organization</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Course Playlist Destination
              </label>
              <select
                id="target-playlist-select"
                value={targetPlaylistChoice}
                onChange={(e) => setTargetPlaylistChoice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-xs font-semibold bg-white focus:outline-none focus:border-[#1D64EC]"
              >
                <option value="new">📁 + Create New Course Playlist in {currentDomainName}</option>
                {domainPlaylists.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.title} {p.channelName ? `(${p.channelName})` : ""}
                  </option>
                ))}
                <option value="none">🎬 Standalone Lecture (No playlist grouping)</option>
              </select>
            </div>

            {targetPlaylistChoice === "new" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Playlist Title <span className="text-slate-400 font-normal">(Auto-detected)</span>
                  </label>
                  <input
                    id="playlist-title-input"
                    type="text"
                    placeholder="e.g. Striver A2Z DSA Course"
                    value={playlistTitleInput}
                    onChange={(e) => setPlaylistTitleInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#1D64EC]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Channel / Creator Name
                  </label>
                  <input
                    id="channel-name-input"
                    type="text"
                    placeholder="e.g. take U forward, CodeHelp"
                    value={channelNameInput}
                    onChange={(e) => setChannelNameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#1D64EC]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center text-xs text-slate-500 pt-6">
                <span>
                  Lectures will be added into{" "}
                  <strong className="text-slate-800">
                    {targetPlaylistChoice === "none"
                      ? "Standalone domain lectures"
                      : domainPlaylists.find((p) => p.id === targetPlaylistChoice)?.title}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Paste Single Link or Direct YouTube Playlist */}
        <div className="pt-4 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
            <span className="w-5 h-5 rounded-full bg-[#1D64EC] text-white text-[11px] flex items-center justify-center font-bold">
              3
            </span>
            <span>Paste YouTube Playlist or Single Video Link</span>
          </label>

          <form onSubmit={handleFetchPreview} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                <input
                  id="youtube-url-input"
                  type="text"
                  placeholder="Paste YouTube Playlist URL (e.g. playlist?list=... OR watch?list=...) OR Single Video"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-1 focus:ring-[#1D64EC] placeholder:text-slate-400"
                />
              </div>

              <button
                id="fetch-preview-button"
                type="submit"
                disabled={previewing || !urlInput.trim()}
                className="btn-primary text-xs font-bold py-2.5 px-6 shrink-0 flex items-center justify-center gap-2 shadow-sm"
              >
                {previewing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting Course...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Fetch &amp; Preview</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Tip: Paste an entire channel playlist link or multiple video links line-by-line. They
              will be grouped under this playlist and never mixed with other channels.
            </p>
          </form>
        </div>

        {/* Step 4: Content Preview Card & Save Button */}
        {previewVideos.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#EEF4FF] border border-blue-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#1D64EC] text-white text-[11px] flex items-center justify-center font-bold">
                    4
                  </span>
                  <span className="text-xs uppercase font-bold text-[#1D64EC] tracking-wider">
                    {isPlaylist ? "Course Playlist Preview" : "Single Lecture Preview"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {playlistTitleInput || "Imported Course"} &bull; {previewVideos.length} Lecture(s)
                  Loaded
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                  <span>
                    Domain: <strong className="text-[#1D64EC]">{currentDomainName}</strong>
                  </span>
                  {channelNameInput && (
                    <>
                      <span>&bull;</span>
                      <span>
                        Channel: <strong className="text-slate-800">{channelNameInput}</strong>
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {previewVideos.length > 1 && (
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleSelectAll(true)}
                      className="text-[#1D64EC] hover:underline font-semibold"
                    >
                      Select All
                    </button>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={() => toggleSelectAll(false)}
                      className="text-slate-500 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                )}

                <button
                  id="save-lectures-button"
                  type="button"
                  onClick={handleSaveToDomain}
                  disabled={savingBatch || selectedCount === 0}
                  className="btn-primary text-xs font-bold py-2.5 px-5 rounded-lg shadow-sm flex items-center gap-2"
                >
                  {savingBatch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Course to Domain...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" />
                      <span>
                        Save {selectedCount} Lecture(s) to {currentDomainName}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* List of Preview Items */}
            <div className="max-h-96 overflow-y-auto space-y-2.5 pr-1 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              {previewVideos.map((video, idx) => (
                <div
                  key={video.youtubeId}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3.5 p-3 rounded-xl border bg-white transition-all ${
                    video.selected ? "border-blue-200 shadow-2xs" : "border-slate-200 opacity-60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSelectVideo(video.youtubeId)}
                    className="p-1 text-[#1D64EC] shrink-0"
                  >
                    {video.selected ? (
                      <CheckSquare className="w-5 h-5 text-[#1D64EC]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300" />
                    )}
                  </button>

                  <div className="text-xs font-mono font-bold text-slate-400 w-6 shrink-0 text-center">
                    #{idx + 1}
                  </div>

                  <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    {video.duration && (
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        {video.duration}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={video.title}
                      onChange={(e) => updatePreviewTitle(video.youtubeId, e.target.value)}
                      className="w-full text-xs font-bold text-slate-900 border border-transparent hover:border-slate-300 focus:border-[#1D64EC] px-2 py-1 rounded bg-transparent focus:bg-white outline-none"
                    />
                    <div className="flex items-center gap-2 mt-0.5 px-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        ID: {video.youtubeId}
                      </span>
                      {channelNameInput && (
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {channelNameInput}
                        </span>
                      )}
                    </div>
                  </div>

                  <a
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-slate-700 shrink-0"
                    title="Open on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featureFirst}
                  onChange={(e) => setFeatureFirst(e.target.checked)}
                  className="rounded text-[#1D64EC]"
                />
                <span>Feature first lecture on the main page header</span>
              </label>

              <button
                type="button"
                onClick={() => setPreviewVideos([])}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Clear Preview
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Curriculum Organized by Channel & Playlist */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Curriculum Playlists &amp; Lectures</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
                {displayedVideos.length} total lectures
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Organized into separate channel playlists per domain so students never get confused.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Filter Domain:</span>
            <select
              value={filterDomainId}
              onChange={(e) => setFilterDomainId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-[#1D64EC]"
            >
              <option value="all">All Domains ({videos.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({videos.filter((v) => v.categoryId === c.id).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1D64EC]" />
            <span>Loading curriculum organization...</span>
          </div>
        ) : playlistGroups.length === 0 && standaloneVideos.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No course playlists or lectures added yet in this filter.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Use the importer above to paste a YouTube playlist and create a course track.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* 1. Distinct Playlists */}
            {playlistGroups.map(({ playlist, videos: pVideos }) => {
              const isExpanded = expandedGroups[playlist.id] !== false;
              const domainName =
                categories.find((c) => c.id === playlist.categoryId)?.name || "Domain";

              return (
                <div
                  key={playlist.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
                >
                  {/* Playlist Header Card */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70 border-b border-slate-100">
                    <div className="flex items-start gap-3.5">
                      <button
                        type="button"
                        onClick={() => toggleGroup(playlist.id)}
                        className="mt-0.5 p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 transition"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-slate-700" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-700" />
                        )}
                      </button>

                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1D64EC] shrink-0">
                        <Folder className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">
                            {playlist.title}
                          </h3>
                          <span className="text-[11px] font-bold bg-[#EEF4FF] text-[#1D64EC] px-2.5 py-0.5 rounded-full">
                            {domainName}
                          </span>
                          {playlist.channelName && (
                            <span className="text-[11px] font-semibold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Tv className="w-3 h-3 text-rose-500" />
                              <span>{playlist.channelName}</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          {pVideos.length} lecture(s) in this channel playlist &bull; Distinctly
                          grouped on home page and lectures catalog
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingPlaylist(playlist)}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition text-xs font-semibold flex items-center gap-1"
                        title="Edit Playlist Info"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Info</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePlaylist(playlist.id, playlist.title)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition text-xs font-semibold flex items-center gap-1"
                        title="Delete Entire Playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Playlist</span>
                      </button>
                    </div>
                  </div>

                  {/* Lectures list for this specific playlist */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      {pVideos.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          No lectures currently in this playlist. Use the importer above and select
                          this playlist to add lectures.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="py-2.5 px-4 w-12 text-center">#</th>
                              <th className="py-2.5 px-4 w-12 text-center">Star</th>
                              <th className="py-2.5 px-4 w-28">Thumbnail</th>
                              <th className="py-2.5 px-4">Lecture Title</th>
                              <th className="py-2.5 px-4 w-24">Duration</th>
                              <th className="py-2.5 px-4 w-20 text-center">Status</th>
                              <th className="py-2.5 px-4 w-28 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {pVideos.map((v, vIdx) => (
                              <tr key={v.id} className="hover:bg-slate-50/60 transition">
                                <td className="py-3 px-4 text-center font-mono text-slate-400">
                                  {vIdx + 1}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => handleToggleFeatured(v)}
                                    className={`p-1 rounded ${
                                      v.featured ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                                    }`}
                                  >
                                    <Star
                                      className="w-4 h-4"
                                      fill={v.featured ? "currentColor" : "none"}
                                    />
                                  </button>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="relative w-20 aspect-video rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                    <Image
                                      src={v.thumbnail}
                                      alt={v.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-bold text-slate-900 block leading-snug">
                                    {v.title}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    ID: {v.youtubeId}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                                  {v.duration || "—"}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                      v.visible
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    {v.visible ? "Live" : "Hidden"}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <a
                                      href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                                      title="Watch on YouTube"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    <button
                                      onClick={() => setEditingVideo(v)}
                                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                                      title="Edit Lecture"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteVideo(v.id, v.title)}
                                      className="p-1.5 text-rose-400 hover:text-rose-600 rounded"
                                      title="Delete Lecture"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 2. Standalone Individual Lectures Section */}
            {standaloneVideos.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-slate-50/70 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleGroup("standalone")}
                      className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 transition"
                    >
                      {expandedGroups["standalone"] !== false ? (
                        <ChevronDown className="w-5 h-5 text-slate-700" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-700" />
                      )}
                    </button>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Standalone Individual Lectures ({standaloneVideos.length})
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Individual deep-dive lectures not linked to a specific channel course series
                      </p>
                    </div>
                  </div>
                </div>

                {expandedGroups["standalone"] !== false && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4 w-12 text-center">#</th>
                          <th className="py-2.5 px-4 w-12 text-center">Star</th>
                          <th className="py-2.5 px-4 w-28">Thumbnail</th>
                          <th className="py-2.5 px-4">Lecture Title &amp; Domain</th>
                          <th className="py-2.5 px-4 w-24">Duration</th>
                          <th className="py-2.5 px-4 w-20 text-center">Status</th>
                          <th className="py-2.5 px-4 w-28 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {standaloneVideos.map((v, idx) => (
                          <tr key={v.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3 px-4 text-center font-mono text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleToggleFeatured(v)}
                                className={`p-1 rounded ${
                                  v.featured ? "text-amber-500" : "text-slate-300 hover:text-slate-500"
                                }`}
                              >
                                <Star
                                  className="w-4 h-4"
                                  fill={v.featured ? "currentColor" : "none"}
                                />
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <div className="relative w-20 aspect-video rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                                <Image
                                  src={v.thumbnail}
                                  alt={v.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block leading-snug">
                                {v.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-semibold text-[#1D64EC] bg-[#EEF4FF] px-2 py-0.5 rounded">
                                  {v.category?.name || "Domain"}
                                </span>
                                {v.channelName && (
                                  <span className="text-[10px] text-slate-500">
                                    {v.channelName}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                              {v.duration || "—"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  v.visible
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {v.visible ? "Live" : "Hidden"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                                  title="Watch on YouTube"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => setEditingVideo(v)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                                  title="Edit Lecture"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteVideo(v.id, v.title)}
                                  className="p-1.5 text-rose-400 hover:text-rose-600 rounded"
                                  title="Delete Lecture"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Add Domain Modal */}
      {domainModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create New Learning Domain</h3>
              <button
                onClick={() => setDomainModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {domainError && (
              <div className="p-3 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {domainError}
              </div>
            )}

            <form onSubmit={handleCreateDomain} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Domain Name
                </label>
                <input
                  id="domain-name-input"
                  type="text"
                  required
                  placeholder="e.g. Data Structure &amp; Algorithm (DSA)"
                  value={domainForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9-]/g, "-")
                      .replace(/-+/g, "-");
                    setDomainForm({ ...domainForm, name, slug });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:border-[#1D64EC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Slug
                </label>
                <input
                  id="domain-slug-input"
                  type="text"
                  required
                  value={domainForm.slug}
                  onChange={(e) => setDomainForm({ ...domainForm, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs font-mono focus:border-[#1D64EC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Icon</label>
                <select
                  value={domainForm.icon}
                  onChange={(e) => setDomainForm({ ...domainForm, icon: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs bg-white focus:border-[#1D64EC] outline-none"
                >
                  <option value="Code2">Code2 (Web / Software)</option>
                  <option value="Server">Server (Backend / APIs)</option>
                  <option value="Layers">Layers (Full Stack)</option>
                  <option value="Cpu">Cpu (AI / ML / Data)</option>
                  <option value="Sparkles">Sparkles (GenAI)</option>
                  <option value="Database">Database / DSA</option>
                  <option value="Cloud">Cloud (DevOps)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDomainModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  id="create-domain-submit-btn"
                  type="submit"
                  disabled={savingDomain}
                  className="btn-primary text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5"
                >
                  {savingDomain && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create &amp; Select Domain</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">Edit Lecture Details</h3>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lecture Title
                </label>
                <input
                  type="text"
                  required
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Domain / Track
                  </label>
                  <select
                    value={editingVideo.categoryId || ""}
                    onChange={(e) =>
                      setEditingVideo({ ...editingVideo, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-[#1D64EC]"
                  >
                    <option value="">Unassigned</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Channel Course Playlist
                  </label>
                  <select
                    value={editingVideo.playlistId || ""}
                    onChange={(e) =>
                      setEditingVideo({
                        ...editingVideo,
                        playlistId: e.target.value || null,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-[#1D64EC]"
                  >
                    <option value="">Standalone (No Playlist)</option>
                    {playlists.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} {p.channelName ? `(${p.channelName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={editingVideo.channelName || ""}
                  onChange={(e) =>
                    setEditingVideo({ ...editingVideo, channelName: e.target.value })
                  }
                  placeholder="e.g. take U forward, CodeHelp"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#1D64EC]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary text-xs font-semibold py-2 px-5 rounded-lg flex items-center gap-2"
                >
                  {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Playlist Info Modal */}
      {editingPlaylist && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Edit Course Playlist</h3>
              <button
                onClick={() => setEditingPlaylist(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlaylistEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Playlist Title
                </label>
                <input
                  type="text"
                  required
                  value={editingPlaylist.title}
                  onChange={(e) =>
                    setEditingPlaylist({ ...editingPlaylist, title: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:border-[#1D64EC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Channel / Creator Name
                </label>
                <input
                  type="text"
                  value={editingPlaylist.channelName || ""}
                  onChange={(e) =>
                    setEditingPlaylist({ ...editingPlaylist, channelName: e.target.value })
                  }
                  placeholder="e.g. take U forward, CampusX"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:border-[#1D64EC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Domain
                </label>
                <select
                  value={editingPlaylist.categoryId || ""}
                  onChange={(e) =>
                    setEditingPlaylist({ ...editingPlaylist, categoryId: e.target.value || null })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs bg-white focus:border-[#1D64EC] outline-none"
                >
                  <option value="">No Domain</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPlaylist(null)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPlaylistEdit}
                  className="btn-primary text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5"
                >
                  {savingPlaylistEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Playlist Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
