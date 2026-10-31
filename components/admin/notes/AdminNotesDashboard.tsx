"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  FileText,
  Globe,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ChevronDown,
  Search,
  LayoutGrid,
  List,
  Files,
  Check,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { getCategoryIcon } from "@/lib/notesIcons";
import { getSuggestedSpecializations } from "@/lib/notesData";

// ── Types ──────────────────────────────────────────────────────────────────
interface DbDomain {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string | null;
  accentColor: string | null;
  pastelBg: string | null;
  pastelBorder?: string | null;
  badgeBg?: string | null;
  badgeText?: string | null;
  isPublished: boolean;
  displayOrder: number;
  _count: { notes: number };
}

interface DbNote {
  id: string;
  domainId: string;
  title: string;
  slug: string;
  category?: string | null;
  difficulty?: string | null;
  description: string | null;
  storagePath: string | null;
  originalFilename: string | null;
  fileSize: number | null;
  pageCount: number | null;
  displayOrder: number;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  domain: { name: string; slug: string };
}

interface Stats {
  totalDomains: number;
  totalNotes: number;
  publishedNotes: number;
  draftNotes: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtBytes(b: number | null) {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all ${
        type === "success"
          ? "bg-emerald-600 text-white"
          : "bg-rose-600 text-white"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── PDF Metadata & Chunked Upload Helpers ────────────────────────────────────

export function cleanFilenameToTitle(filename: string): string {
  if (!filename) return "";
  let name = filename.replace(/\.[^/.]+$/, "");
  name = name.replace(/^[\d\s._-]+/, "");
  name = name.replace(/[-_.]+/g, " ");
  name = name.replace(/\s+/g, " ").trim();
  return name
    .split(" ")
    .map((word) => {
      if (!word) return "";
      if (word.length <= 4 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function readBinarySlice(file: File, maxBytes = 2500000): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || "");
    reader.onerror = () => resolve("");
    const slice = file.slice(0, Math.min(file.size, maxBytes));
    reader.readAsBinaryString(slice);
  });
}

export async function extractPdfMetadata(file: File): Promise<{
  title: string;
  pageCount: number;
  size: number;
}> {
  const title = cleanFilenameToTitle(file.name);
  let pageCount = 1;

  // 1. Try reading with PDF.js if available in browser
  try {
    const pdfjsLib = typeof window !== "undefined" ? (window as any)?.pdfjsLib : null;
    if (pdfjsLib) {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: buffer,
        cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
        cMapPacked: true,
      });
      const pdf = await loadingTask.promise;
      if (pdf && pdf.numPages > 0) {
        return { title, pageCount: pdf.numPages, size: file.size };
      }
    }
  } catch (err) {
    // fallback
  }

  // 2. Binary fallback scanning for /Count N and /Type /Page
  try {
    const text = await readBinarySlice(file);
    const countMatches: number[] = [];
    const countRegex = /\/Count\s+(\d+)/g;
    let match: RegExpExecArray | null;
    while ((match = countRegex.exec(text)) !== null) {
      countMatches.push(parseInt(match[1]));
    }
    if (countMatches.length > 0) {
      const maxCount = Math.max(...countMatches);
      if (maxCount > 0 && maxCount < 5000) {
        return { title, pageCount: maxCount, size: file.size };
      }
    }

    const pageMatches = text.match(/\/Type\s*\/Page[^s]/g);
    if (pageMatches && pageMatches.length > 0) {
      return { title, pageCount: pageMatches.length, size: file.size };
    }
  } catch {}

  return { title, pageCount, size: file.size };
}

export async function uploadPdfFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; filename: string; size: number }> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Only PDF files are accepted.");
  }
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("File exceeds 50 MB limit. Please select a smaller PDF or use 'Paste PDF Link'.");
  }

  const CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB slices
  const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
  const uploadId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `up_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  let resultData: any = null;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunkBlob = file.slice(start, end);

    const fd = new FormData();
    fd.append("file", chunkBlob, file.name);
    fd.append("uploadId", uploadId);
    fd.append("chunkIndex", i.toString());
    fd.append("totalChunks", totalChunks.toString());
    fd.append("filename", file.name);
    fd.append("mimeType", file.type || "application/pdf");

    const res = await fetch("/api/admin/notes/upload", {
      method: "POST",
      body: fd,
    });

    const text = await res.text();
    if (!res.ok) {
      let errMsg = `Upload failed with HTTP ${res.status}`;
      try {
        const errJson = JSON.parse(text);
        if (errJson.error) errMsg = errJson.error;
      } catch {
        if (text && text.length < 200) errMsg = text.trim();
      }
      throw new Error(errMsg);
    }

    let json: any = {};
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error("Invalid response received from upload server.");
    }

    const pct = Math.round(((i + 1) / totalChunks) * 100);
    if (onProgress) onProgress(pct);

    if (json.complete) {
      resultData = json;
    }
  }

  if (resultData) {
    return { url: resultData.url, filename: resultData.filename, size: resultData.size };
  } else {
    throw new Error("Upload completed without receiving file URL");
  }
}

// ── Drag-Drop & External Link PDF Upload ────────────────────────────────────
function PdfUploadArea({
  value,
  onChange,
  onAutoFill,
  onMultipleFiles,
}: {
  value: { url: string; name: string; size: number } | null;
  onChange: (v: { url: string; name: string; size: number } | null) => void;
  onAutoFill?: (meta: { title: string; pageCount: number }) => void;
  onMultipleFiles?: (files: File[]) => void;
}) {
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [directUrl, setDirectUrl] = useState(
    value?.url && !value.url.startsWith("/api/") ? value.url : ""
  );
  const [directName, setDirectName] = useState(value?.name || "");

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setError("");
    const cleanTitle = cleanFilenameToTitle(file.name);
    if (onAutoFill) {
      onAutoFill({ title: cleanTitle, pageCount: 1 });
    }

    // Auto extract exact page count in parallel
    extractPdfMetadata(file).then((meta) => {
      if (onAutoFill) {
        onAutoFill({ title: meta.title || cleanTitle, pageCount: meta.pageCount });
      }
    });

    setUploading(true);
    setProgress(5);
    try {
      const res = await uploadPdfFile(file, (p) => setProgress(p));
      onChange({ url: res.url, name: res.filename, size: res.size });
    } catch (e: any) {
      console.error("Upload error:", e);
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleApplyUrl = () => {
    setError("");
    if (!directUrl.trim()) {
      setError("Please enter a valid URL");
      return;
    }
    const name = directName.trim() || directUrl.split("/").pop()?.split("?")[0] || "document.pdf";
    const cleanTitle = cleanFilenameToTitle(name);
    if (onAutoFill) {
      onAutoFill({ title: cleanTitle, pageCount: 1 });
    }
    onChange({ url: directUrl.trim(), name, size: 0 });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (files.length > 1 && onMultipleFiles) {
      onMultipleFiles(files);
      return;
    }
    if (files[0]) handleProcessFile(files[0]);
  };

  return (
    <div className="space-y-2">
      {/* Tab toggle between Direct Upload and External Link */}
      {!value && (
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              mode === "upload"
                ? "bg-[#EEF4FF] text-[#1D64EC] border-blue-200"
                : "text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
              mode === "link"
                ? "bg-[#EEF4FF] text-[#1D64EC] border-blue-200"
                : "text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            Paste PDF Link
          </button>
        </div>
      )}

      {value ? (
        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
          <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-emerald-900 truncate">{value.name}</p>
            <p className="text-xs text-emerald-600 font-mono truncate">
              {value.size > 0 ? fmtBytes(value.size) : value.url}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setDirectUrl("");
              setDirectName("");
            }}
            className="text-emerald-600 hover:text-rose-600 p-1 rounded-lg transition"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : mode === "upload" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragging
              ? "border-[#1D64EC] bg-[#EEF4FF]"
              : "border-slate-300 hover:border-[#1D64EC] hover:bg-slate-50"
          }`}
        >
          {uploading ? (
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 text-[#1D64EC] animate-spin mx-auto" />
              <p className="text-sm text-slate-700 font-medium">Uploading to database... {progress}%</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 max-w-xs mx-auto">
                <div
                  className="bg-[#1D64EC] h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                Drag and drop your PDF here
              </p>
              <p className="text-xs text-slate-500 mt-1">or browse files from your computer</p>
              <p className="text-xs text-slate-400 mt-2">Saved directly into database · PDF only</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []).filter(
                (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
              );
              if (files.length > 1 && onMultipleFiles) {
                onMultipleFiles(files);
                return;
              }
              if (files[0]) handleProcessFile(files[0]);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        /* Direct link input */
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Direct PDF URL *
            </label>
            <input
              type="url"
              value={directUrl}
              onChange={(e) => setDirectUrl(e.target.value)}
              placeholder="https://example.com/notes.pdf or Google Drive / GitHub link"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#1D64EC]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Display Filename (optional)
            </label>
            <input
              type="text"
              value={directName}
              onChange={(e) => setDirectName(e.target.value)}
              placeholder="e.g. System Design Alex Xu.pdf"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-[#1D64EC]"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyUrl}
            className="text-xs font-semibold px-4 py-2 bg-[#1D64EC] text-white rounded-lg hover:bg-[#1a56d4] transition"
          >
            Attach Link
          </button>
        </div>
      )}

      {error && <p className="text-xs text-rose-600 mt-1.5">{error}</p>}
    </div>
  );
}

// ── Domain Modal ───────────────────────────────────────────────────────────
const ACCENT_PRESETS = [
  { label: "Blue", accentColor: "#1D64EC", pastelBg: "#EEF4FF", pastelBorder: "#BFDBFE", badgeBg: "#DBEAFE", badgeText: "#1E40AF" },
  { label: "Orange", accentColor: "#EA580C", pastelBg: "#FFF4EC", pastelBorder: "#FDE5D4", badgeBg: "#FFEDD5", badgeText: "#9A3412" },
  { label: "Green", accentColor: "#059669", pastelBg: "#ECFDF5", pastelBorder: "#A7F3D0", badgeBg: "#D1FAE5", badgeText: "#065F46" },
  { label: "Purple", accentColor: "#7C3AED", pastelBg: "#F5F3FF", pastelBorder: "#DDD6FE", badgeBg: "#EDE9FE", badgeText: "#5B21B6" },
  { label: "Amber", accentColor: "#D97706", pastelBg: "#FFFBEB", pastalBorder: "#FDE68A", badgeBg: "#FEF3C7", badgeText: "#92400E" },
  { label: "Pink", accentColor: "#E11D48", pastelBg: "#FFF1F2", pastelBorder: "#FECDD3", badgeBg: "#FFE4E6", badgeText: "#9F1239" },
  { label: "Cyan", accentColor: "#0891B2", pastelBg: "#ECFEFF", pastelBorder: "#A5F3FC", badgeBg: "#CFFAFE", badgeText: "#155E75" },
  { label: "Indigo", accentColor: "#4F46E5", pastelBg: "#EEF2FF", pastelBorder: "#C7D2FE", badgeBg: "#E0E7FF", badgeText: "#3730A3" },
] as any[];

function DomainModal({
  domain,
  onClose,
  onSaved,
}: {
  domain: DbDomain | null;
  onClose: () => void;
  onSaved: (d: DbDomain) => void;
}) {
  const isEdit = !!domain;
  const [name, setName] = useState(domain?.name || "");
  const [slug, setSlug] = useState(domain?.slug || "");
  const [desc, setDesc] = useState(domain?.description || "");
  const [accent, setAccent] = useState(
    ACCENT_PRESETS.find((p) => p.accentColor === domain?.accentColor) ||
      ACCENT_PRESETS[0]
  );
  const [iconName, setIconName] = useState(domain?.iconName || "BookOpen");
  const [order, setOrder] = useState(domain?.displayOrder ?? 0);
  const [published, setPublished] = useState(domain?.isPublished ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const autoSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...(isEdit ? { id: domain!.id } : {}),
        name,
        slug: slug || autoSlug,
        description: desc,
        iconName,
        accentColor: accent.accentColor,
        pastelBg: accent.pastelBg,
        pastelBorder: accent.pastelBorder || accent.pastalBorder,
        badgeBg: accent.badgeBg,
        badgeText: accent.badgeText,
        displayOrder: order,
        isPublished: published,
      };
      const res = await fetch("/api/admin/notes/domains", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save domain");
      onSaved(data.domain);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isEdit ? "Edit Domain" : "Create Domain"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Domain Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. DSA Notes"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              URL Slug
            </label>
            <input
              value={slug || autoSlug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={autoSlug || "auto-generated"}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10 text-slate-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Will appear as /notes/<strong>{slug || autoSlug || "..."}</strong>
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description *
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              rows={3}
              placeholder="Brief description of this domain..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10 resize-none"
            />
          </div>

          {/* Icon Choice */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category Icon
            </label>
            <select
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
            >
              <option value="GitBranch">GitBranch (DSA / Algorithms)</option>
              <option value="Code2">Code2 (Web Development)</option>
              <option value="Server">Server (Backend Development)</option>
              <option value="Layers">Layers (Full Stack Development)</option>
              <option value="BookOpen">BookOpen (CS Fundamentals)</option>
              <option value="BrainCircuit">BrainCircuit (Generative AI)</option>
              <option value="Brain">Brain (Machine Learning)</option>
              <option value="Trophy">Trophy (Competitive Programming)</option>
              <option value="Workflow">Workflow (System Design)</option>
              <option value="Cloud">Cloud (DevOps & Cloud)</option>
            </select>
          </div>

          {/* Color preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Card Color
            </label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setAccent(p)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    accent.label === p.label
                      ? "border-[#1D64EC] bg-[#EEF4FF] text-[#1D64EC]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.accentColor }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Order + Published */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
              />
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setPublished(!published)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    published ? "bg-[#1D64EC]" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      published ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {published ? "Published" : "Hidden"}
                </span>
              </label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#1D64EC] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#1a56d4] transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Domain"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Bulk Upload Modal ───────────────────────────────────────────────────────
interface BulkItem {
  id: string;
  file: File;
  title: string;
  pageCount: number;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  size: number;
  status: "idle" | "uploading" | "saving" | "done" | "error";
  progress: number;
  error?: string;
  noteResult?: DbNote;
}

function BulkNotesUploadModal({
  domains,
  initialFiles,
  defaultDomainId,
  onClose,
  onSavedBatch,
}: {
  domains: DbDomain[];
  initialFiles?: File[];
  defaultDomainId?: string;
  onClose: () => void;
  onSavedBatch: (notes: DbNote[]) => void;
}) {
  const [domainId, setDomainId] = useState(defaultDomainId || domains[0]?.id || "");
  const [globalDifficulty, setGlobalDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [globalStatus, setGlobalStatus] = useState<"published" | "draft">("published");
  const [items, setItems] = useState<BulkItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDomain = domains.find((d) => d.id === domainId);
  const suggestedSpecializations = selectedDomain
    ? getSuggestedSpecializations(selectedDomain.slug)
    : [];
  const defaultCategory = suggestedSpecializations[0] || "General";

  const addFiles = (files: File[]) => {
    const valid = files.filter(
      (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    );
    if (valid.length === 0) return;

    const newItems: BulkItem[] = valid.map((file, idx) => {
      const id = `${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 7)}`;
      const title = cleanFilenameToTitle(file.name);
      return {
        id,
        file,
        title,
        pageCount: 1,
        category: defaultCategory,
        difficulty: globalDifficulty,
        size: file.size,
        status: "idle",
        progress: 0,
      };
    });

    setItems((prev) => [...prev, ...newItems]);

    // Asynchronously detect exact page counts for each file
    newItems.forEach((item) => {
      extractPdfMetadata(item.file).then((meta) => {
        setItems((current) =>
          current.map((ci) =>
            ci.id === item.id
              ? { ...ci, pageCount: meta.pageCount, title: ci.title || meta.title }
              : ci
          )
        );
      });
    });
  };

  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      addFiles(initialFiles);
    }
  }, [initialFiles]);

  const removeItem = (id: string) => {
    if (isProcessing) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, updates: Partial<BulkItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const handleStartBulkUpload = async () => {
    if (!domainId) return;
    const pendingItems = items.filter((i) => i.status !== "done");
    if (pendingItems.length === 0) return;

    setIsProcessing(true);
    const createdNotes: DbNote[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === "done") continue;

      updateItem(item.id, { status: "uploading", progress: 5, error: undefined });

      try {
        // Step 1: Chunked upload
        const uploadRes = await uploadPdfFile(item.file, (p) => {
          updateItem(item.id, { progress: p });
        });

        // Step 2: Save to database
        updateItem(item.id, { status: "saving" });

        const payload = {
          domainId,
          title: item.title.trim() || cleanFilenameToTitle(item.file.name),
          category: item.category.trim() || defaultCategory,
          difficulty: item.difficulty || globalDifficulty,
          description: `Comprehensive study notes for ${item.title}.`,
          storagePath: uploadRes.url,
          originalFilename: uploadRes.filename,
          fileSize: uploadRes.size,
          pageCount: item.pageCount || 1,
          displayOrder: i,
          status: globalStatus,
        };

        const res = await fetch("/api/admin/notes/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "Failed to save note record");

        createdNotes.push(resData.note);
        updateItem(item.id, { status: "done", progress: 100, noteResult: resData.note });
      } catch (err: any) {
        console.error("Bulk upload error:", err);
        updateItem(item.id, { status: "error", error: err.message || "Upload failed" });
      }
    }

    setIsProcessing(false);
    if (createdNotes.length > 0) {
      onSavedBatch(createdNotes);
    }
  };

  const completedCount = items.filter((i) => i.status === "done").length;
  const pendingCount = items.filter((i) => i.status !== "done").length;
  const totalBytes = items.reduce((acc, i) => acc + i.size, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col my-auto border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center">
              <Files className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Bulk Upload PDF Notes
              </h2>
              <p className="text-xs text-slate-500">
                Select multiple PDFs at once. Titles and page counts are automatically extracted.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 overscroll-contain">
          {/* Settings Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Domain *</label>
              <select
                value={domainId}
                disabled={isProcessing}
                onChange={(e) => setDomainId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1D64EC]"
              >
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Difficulty</label>
              <select
                value={globalDifficulty}
                disabled={isProcessing}
                onChange={(e) => setGlobalDifficulty(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1D64EC]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Publication Status</label>
              <select
                value={globalStatus}
                disabled={isProcessing}
                onChange={(e) => setGlobalStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#1D64EC]"
              >
                <option value="published">Publish Live Immediately</option>
                <option value="draft">Save as Drafts</option>
              </select>
            </div>
          </div>

          {/* Multiple File Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!isProcessing) setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              if (!isProcessing) addFiles(Array.from(e.dataTransfer.files));
            }}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/70"
                : "border-slate-300 hover:border-indigo-500 hover:bg-slate-50"
            } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(Array.from(e.target.files));
                e.target.value = "";
              }}
            />
            <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              Click to browse or drop multiple PDF files here
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Select 2, 5, 10 or more PDF notes. Each will be processed and published automatically.
            </p>
          </div>

          {/* Queue List */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Files className="w-3.5 h-3.5 text-indigo-600" />
                  Files Queue ({items.length} PDFs · {fmtBytes(totalBytes)})
                </span>
                {!isProcessing && (
                  <button
                    onClick={() => setItems([])}
                    className="text-xs text-rose-500 hover:text-rose-700 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className={`p-3.5 rounded-xl border transition ${
                      it.status === "done"
                        ? "bg-emerald-50/70 border-emerald-200"
                        : it.status === "error"
                        ? "bg-rose-50/70 border-rose-200"
                        : it.status === "uploading"
                        ? "bg-blue-50/50 border-blue-200"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                      <div className="flex items-center gap-2 min-w-0 sm:w-1/3">
                        <FileText
                          className={`w-4 h-4 shrink-0 ${
                            it.status === "done"
                              ? "text-emerald-600"
                              : it.status === "error"
                              ? "text-rose-600"
                              : "text-slate-400"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-700 truncate" title={it.file.name}>
                            {it.file.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{fmtBytes(it.size)}</p>
                        </div>
                      </div>

                      {/* Title input */}
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          disabled={isProcessing || it.status === "done"}
                          value={it.title}
                          onChange={(e) => updateItem(it.id, { title: e.target.value })}
                          placeholder="Note Title"
                          className="w-full text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#1D64EC] bg-white"
                        />
                      </div>

                      {/* Specialization Topic */}
                      <div className="w-full sm:w-36">
                        <input
                          type="text"
                          disabled={isProcessing || it.status === "done"}
                          value={it.category}
                          onChange={(e) => updateItem(it.id, { category: e.target.value })}
                          placeholder="Topic"
                          className="w-full text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#1D64EC] bg-white"
                        />
                      </div>

                      {/* Page Count */}
                      <div className="flex items-center gap-1 w-full sm:w-20">
                        <input
                          type="number"
                          disabled={isProcessing || it.status === "done"}
                          value={it.pageCount}
                          onChange={(e) =>
                            updateItem(it.id, { pageCount: parseInt(e.target.value) || 1 })
                          }
                          title="Page Count"
                          className="w-full text-xs font-semibold text-center border border-slate-200 rounded-lg px-1.5 py-1.5 focus:outline-none focus:border-[#1D64EC] bg-white"
                        />
                        <span className="text-[10px] text-slate-400">pg</span>
                      </div>

                      {/* Status / Remove button */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-24 shrink-0">
                        {it.status === "done" ? (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Done
                          </span>
                        ) : it.status === "uploading" ? (
                          <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> {it.progress}%
                          </span>
                        ) : it.status === "saving" ? (
                          <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Saving
                          </span>
                        ) : it.status === "error" ? (
                          <span
                            className="text-[10px] font-bold text-rose-600 truncate max-w-[80px]"
                            title={it.error}
                          >
                            Error
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => removeItem(it.id)}
                            disabled={isProcessing}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                            title="Remove file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Per-item progress bar when uploading */}
                    {it.status === "uploading" && (
                      <div className="w-full bg-blue-100 rounded-full h-1 mt-2">
                        <div
                          className="bg-[#1D64EC] h-1 rounded-full transition-all duration-200"
                          style={{ width: `${it.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100 shrink-0 rounded-b-2xl">
          <div className="text-xs text-slate-500 font-medium">
            {completedCount > 0 && `${completedCount} of ${items.length} uploaded`}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-white transition disabled:opacity-50"
            >
              {completedCount === items.length && items.length > 0 ? "Done" : "Cancel"}
            </button>

            <button
              type="button"
              disabled={isProcessing || pendingCount === 0}
              onClick={handleStartBulkUpload}
              className="px-5 py-2.5 bg-[#1D64EC] hover:bg-[#1a56d4] text-white rounded-xl text-xs font-bold transition disabled:opacity-60 flex items-center gap-2 shadow-xs"
            >
              {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isProcessing
                  ? `Uploading (${completedCount}/${items.length})...`
                  : `Upload All (${pendingCount} Notes)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Note Modal ─────────────────────────────────────────────────────────────
function NoteModal({
  note,
  domains,
  defaultDomainId,
  onClose,
  onSaved,
  onSwitchToBulk,
}: {
  note: DbNote | null;
  domains: DbDomain[];
  defaultDomainId?: string;
  onClose: () => void;
  onSaved: (n: DbNote) => void;
  onSwitchToBulk?: (files?: File[]) => void;
}) {
  const isEdit = !!note;
  const [domainId, setDomainId] = useState(
    note?.domainId || defaultDomainId || domains[0]?.id || ""
  );

  const selectedDomain = domains.find((d) => d.id === domainId);
  const suggestedSpecializations = selectedDomain
    ? getSuggestedSpecializations(selectedDomain.slug)
    : [];

  const initialCat = note?.category || suggestedSpecializations[0] || "General";
  const [category, setCategory] = useState(initialCat);
  const [isCustomCategory, setIsCustomCategory] = useState(
    !!note?.category && !suggestedSpecializations.includes(note.category)
  );

  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">(
    ((note?.difficulty as any) || "Beginner") as "Beginner" | "Intermediate" | "Advanced"
  );

  const [title, setTitle] = useState(note?.title || "");
  const [desc, setDesc] = useState(note?.description || "");
  const [pdf, setPdf] = useState<{ url: string; name: string; size: number } | null>(
    note?.storagePath
      ? { url: note.storagePath, name: note.originalFilename || "file.pdf", size: note.fileSize || 0 }
      : null
  );
  const [pageCount, setPageCount] = useState(note?.pageCount?.toString() || "");
  const [order, setOrder] = useState(note?.displayOrder ?? 0);
  const [status, setStatus] = useState<"draft" | "published">(
    (note?.status as "draft" | "published") || "draft"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAutoFill = (meta: { title: string; pageCount: number }) => {
    if (!title.trim() || title === "e.g. Arrays and Strings Complete Notes") {
      setTitle(meta.title);
    }
    if (meta.pageCount > 0) {
      setPageCount(meta.pageCount.toString());
    }
  };

  const handleSubmit = async (publishNow?: boolean) => {
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    if (!domainId) { setError("Please select a domain"); return; }
    setSaving(true);
    try {
      const finalStatus = publishNow ? "published" : status;
      const finalCategory = category.trim() || "General";
      const payload = {
        ...(isEdit ? { id: note!.id } : {}),
        domainId,
        title: title.trim(),
        category: finalCategory,
        difficulty,
        description: desc,
        storagePath: pdf?.url || null,
        originalFilename: pdf?.name || null,
        fileSize: pdf?.size || null,
        pageCount: pageCount ? parseInt(pageCount) : null,
        displayOrder: order,
        status: finalStatus,
      };
      const res = await fetch("/api/admin/notes/notes", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save note");
      onSaved(data.note);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[88vh] flex flex-col my-auto border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Sticky Fixed Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1D64EC]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isEdit ? "Edit Note" : "Add Note"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isEdit && onSwitchToBulk && (
              <button
                type="button"
                onClick={() => onSwitchToBulk()}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
                title="Switch to bulk multiple PDF upload"
              >
                <Files className="w-3.5 h-3.5" />
                <span>Bulk Upload</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {/* Domain */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Domain *
            </label>
            <select
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
            >
              <option value="">— Select Domain —</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Note Title *
              </label>
              {title && (
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3" /> Auto-fetched from PDF
                </span>
              )}
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Arrays and Strings Complete Notes"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
            />
          </div>

          {/* Specialization / Category & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Specialization Topic *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[11px] text-[#1D64EC] hover:underline font-semibold"
                >
                  {isCustomCategory ? "Choose from list" : "+ Custom topic"}
                </button>
              </div>

              {isCustomCategory ? (
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. React Architecture"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setIsCustomCategory(true);
                      setCategory("");
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
                >
                  {suggestedSpecializations.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                  <option value="__custom__">+ Custom Specialization...</option>
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "Beginner" | "Intermediate" | "Advanced")
                }
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Short Description
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
              placeholder="What does this note cover?"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10 resize-none"
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              PDF File
            </label>
            <PdfUploadArea
              value={pdf}
              onChange={setPdf}
              onAutoFill={handleAutoFill}
              onMultipleFiles={(files) => {
                if (onSwitchToBulk) onSwitchToBulk(files);
              }}
            />
          </div>

          {/* Page count + order */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Page Count
                </label>
                {pageCount && (
                  <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3" /> Auto-detected
                  </span>
                )}
              </div>
              <input
                type="number"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                placeholder="e.g. 15"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 rounded-xl px-3 py-2">{error}</p>
          )}
        </div>

        {/* Sticky Fixed Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-100 shrink-0 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => { setStatus("draft"); handleSubmit(false); }}
            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-white transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && status === "draft" && <Loader2 className="w-4 h-4 animate-spin" />}
            Save as Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(true)}
            className="px-5 py-2.5 bg-[#1D64EC] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#1a56d4] transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-xs"
          >
            {saving && status === "published" && <Loader2 className="w-4 h-4 animate-spin" />}
            <Globe className="w-3.5 h-3.5" />
            Publish Note
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: number;
  color?: "blue" | "green" | "amber" | "slate";
}) {
  const cls = {
    blue: "bg-[#EEF4FF] text-[#1D64EC] border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
  }[color];
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs font-semibold mt-0.5 opacity-80">{label}</div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function AdminNotesDashboard({
  initialDomains,
  stats: initialStats,
}: {
  initialDomains: DbDomain[];
  stats: Stats;
}) {
  const [tab, setTab] = useState<"domains" | "notes">("domains");
  const [domains, setDomains] = useState<DbDomain[]>(initialDomains);
  const [notes, setNotes] = useState<DbNote[]>([]);
  const [notesLoaded, setNotesLoaded] = useState(false);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Modals
  const [domainModal, setDomainModal] = useState<DbDomain | null | false>(false);
  const [noteModal, setNoteModal] = useState<DbNote | null | false>(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkInitialFiles, setBulkInitialFiles] = useState<File[]>([]);
  const [defaultDomainForNote, setDefaultDomainForNote] = useState<string | undefined>();

  // Preload PDF.js in background for instant page count extraction
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).pdfjsLib) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
    };
    document.head.appendChild(script);
  }, []);

  // Filters
  const [noteSearch, setNoteSearch] = useState("");
  const [noteDomainFilter, setNoteDomainFilter] = useState("all");
  const [noteStatusFilter, setNoteStatusFilter] = useState("all");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<
    { type: "domain"; item: DbDomain } | { type: "note"; item: DbNote } | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load notes when tab switches to notes
  const loadNotes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notes/notes");
      const data = await res.json();
      if (data.notes) {
        setNotes(data.notes);
        setNotesLoaded(true);
      }
    } catch {
      showToast("Failed to load notes", "error");
    }
  }, []);

  const handleTabChange = (t: "domains" | "notes") => {
    setTab(t);
    if (t === "notes" && !notesLoaded) loadNotes();
  };

  // Refresh stats
  const refreshStats = useCallback(async () => {
    try {
      const [dRes, nRes] = await Promise.all([
        fetch("/api/admin/notes/domains"),
        fetch("/api/admin/notes/notes"),
      ]);
      const dData = await dRes.json();
      const nData = await nRes.json();
      if (dData.domains) setDomains(dData.domains);
      if (nData.notes) {
        setNotes(nData.notes);
        setNotesLoaded(true);
        const allNotes: DbNote[] = nData.notes;
        setStats({
          totalDomains: dData.domains?.length ?? stats.totalDomains,
          totalNotes: allNotes.length,
          publishedNotes: allNotes.filter((n) => n.status === "published").length,
          draftNotes: allNotes.filter((n) => n.status === "draft").length,
        });
      }
    } catch {}
  }, [stats.totalDomains]);

  // Toggle domain publish
  const toggleDomainPublish = async (d: DbDomain) => {
    try {
      const res = await fetch("/api/admin/notes/domains", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: d.id, isPublished: !d.isPublished }),
      });
      if (!res.ok) throw new Error("Failed");
      setDomains((prev) =>
        prev.map((x) => (x.id === d.id ? { ...x, isPublished: !d.isPublished } : x))
      );
      showToast(d.isPublished ? "Domain hidden from public" : "Domain published ✓");
    } catch {
      showToast("Failed to update domain", "error");
    }
  };

  // Toggle note status
  const toggleNoteStatus = async (n: DbNote) => {
    const newStatus = n.status === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/admin/notes/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setNotes((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, status: newStatus } : x))
      );
      showToast(newStatus === "published" ? "Note published ✓" : "Note set to draft");
      refreshStats();
    } catch {
      showToast("Failed to update note", "error");
    }
  };

  // Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const isD = deleteTarget.type === "domain";
      const res = await fetch(
        isD ? "/api/admin/notes/domains" : "/api/admin/notes/notes",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: deleteTarget.item.id }),
        }
      );
      if (!res.ok) throw new Error("Failed to delete");
      if (isD) {
        setDomains((prev) => prev.filter((d) => d.id !== deleteTarget.item.id));
      } else {
        setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.item.id));
      }
      showToast(`${isD ? "Domain" : "Note"} deleted`);
      refreshStats();
      setDeleteTarget(null);
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered notes
  const filteredNotes = notes.filter((n) => {
    const q = noteSearch.toLowerCase();
    const matchSearch =
      !q || n.title.toLowerCase().includes(q) || n.domain.name.toLowerCase().includes(q);
    const matchDomain = noteDomainFilter === "all" || n.domainId === noteDomainFilter;
    const matchStatus = noteStatusFilter === "all" || n.status === noteStatusFilter;
    return matchSearch && matchDomain && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Notes Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your learning resources, organize domains, and publish notes to Zenvora.
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/notes"
            target="_blank"
            className="flex items-center gap-2 text-xs font-semibold border border-slate-200 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-50 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            View Public Notes
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Domains" value={stats.totalDomains} color="blue" />
        <StatCard label="Total Notes" value={stats.totalNotes} color="slate" />
        <StatCard label="Published" value={stats.publishedNotes} color="green" />
        <StatCard label="Drafts" value={stats.draftNotes} color="amber" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["domains", "notes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`px-5 py-2 rounded-lg text-xs font-bold capitalize transition ${
              tab === t
                ? "bg-white text-[#1D64EC] shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t === "domains" ? "Domains" : "All Notes"}
          </button>
        ))}
      </div>

      {/* ── Domains Tab ── */}
      {tab === "domains" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">
              {domains.length} domain{domains.length !== 1 ? "s" : ""} total
            </p>
            <button
              onClick={() => setDomainModal(null)}
              className="flex items-center gap-2 bg-[#1D64EC] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1a56d4] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Domain
            </button>
          </div>

          {domains.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">No domains yet</h3>
              <p className="text-xs text-slate-500 mb-4">
                Create your first domain to start building your Notes library.
              </p>
              <button
                onClick={() => setDomainModal(null)}
                className="bg-[#1D64EC] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#1a56d4] transition"
              >
                + Create Domain
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {domains.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 hover:shadow-md transition"
                  style={{ borderLeft: `4px solid ${d.accentColor || "#1D64EC"}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: d.badgeBg || "#DBEAFE",
                          color: d.badgeText || d.accentColor || "#1E40AF",
                        }}
                      >
                        {React.createElement(getCategoryIcon(d), { className: "w-4 h-4" })}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{d.name}</h3>
                        <p className="text-[11px] text-slate-500 font-mono">/notes/{d.slug}</p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.isPublished
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {d.isPublished ? "Published" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{d.description}</p>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    {d._count.notes} note{d._count.notes !== 1 ? "s" : ""}
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => setDomainModal(d)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-[#1D64EC] transition px-2 py-1 rounded-lg hover:bg-slate-50"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => toggleDomainPublish(d)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-[#1D64EC] transition px-2 py-1 rounded-lg hover:bg-slate-50"
                    >
                      {d.isPublished ? (
                        <><EyeOff className="w-3 h-3" /> Hide</>
                      ) : (
                        <><Eye className="w-3 h-3" /> Publish</>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setDefaultDomainForNote(d.id);
                        setBulkInitialFiles([]);
                        setBulkModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition px-2 py-1 rounded-lg hover:bg-indigo-50"
                      title="Bulk upload multiple PDF notes to this domain"
                    >
                      <Files className="w-3 h-3" /> Bulk Upload
                    </button>
                    <button
                      onClick={() => {
                        setDefaultDomainForNote(d.id);
                        setNoteModal(null);
                      }}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-[#1D64EC] hover:text-[#1a56d4] transition px-2 py-1 rounded-lg hover:bg-[#EEF4FF]"
                    >
                      <Plus className="w-3 h-3" /> Add Note
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: "domain", item: d })}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-500 hover:text-rose-700 transition ml-auto px-2 py-1 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Notes Tab ── */}
      {tab === "notes" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
              />
            </div>
            {/* Domain filter */}
            <select
              value={noteDomainFilter}
              onChange={(e) => setNoteDomainFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
            >
              <option value="all">All Domains</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {/* Status filter */}
            <select
              value={noteStatusFilter}
              onChange={(e) => setNoteStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1D64EC] focus:ring-4 focus:ring-[#1D64EC]/10"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => {
                  setDefaultDomainForNote(noteDomainFilter !== "all" ? noteDomainFilter : undefined);
                  setBulkInitialFiles([]);
                  setBulkModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs"
                title="Select multiple PDFs and upload them all at once"
              >
                <Files className="w-3.5 h-3.5" />
                <span>Bulk Upload PDFs</span>
              </button>
              <button
                onClick={() => { setDefaultDomainForNote(undefined); setNoteModal(null); }}
                className="flex items-center gap-2 bg-[#1D64EC] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1a56d4] transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Note
              </button>
            </div>
          </div>

          {!notesLoaded ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#1D64EC]" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {notes.length === 0 ? "No notes yet" : "No notes match your filters"}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                {notes.length === 0
                  ? "Create your first note to start building your learning library."
                  : "Try adjusting your search or filters."}
              </p>
              {notes.length === 0 && (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setDefaultDomainForNote(undefined);
                      setBulkInitialFiles([]);
                      setBulkModalOpen(true);
                    }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-2xs"
                  >
                    <Files className="w-3.5 h-3.5" />
                    Bulk Upload PDFs
                  </button>
                  <button
                    onClick={() => { setDefaultDomainForNote(undefined); setNoteModal(null); }}
                    className="bg-[#1D64EC] text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#1a56d4] transition shadow-xs"
                  >
                    + Add Note
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left font-semibold text-slate-600 px-4 py-3">Title</th>
                    <th className="text-left font-semibold text-slate-600 px-4 py-3 hidden sm:table-cell">Domain</th>
                    <th className="text-left font-semibold text-slate-600 px-4 py-3 hidden md:table-cell">File</th>
                    <th className="text-left font-semibold text-slate-600 px-4 py-3">Status</th>
                    <th className="text-left font-semibold text-slate-600 px-4 py-3 hidden lg:table-cell">Updated</th>
                    <th className="text-right font-semibold text-slate-600 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotes.map((n, i) => (
                    <tr
                      key={n.id}
                      className={`border-b border-slate-50 hover:bg-slate-50/50 transition ${
                        i === filteredNotes.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 line-clamp-1">{n.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {n.category && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {n.category}
                            </span>
                          )}
                          {n.difficulty && (
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                n.difficulty === "Beginner"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : n.difficulty === "Intermediate"
                                  ? "bg-blue-50 text-[#1D64EC]"
                                  : "bg-purple-50 text-purple-700"
                              }`}
                            >
                              {n.difficulty}
                            </span>
                          )}
                          {n.pageCount && (
                            <span className="text-slate-400 text-[10px]">{n.pageCount} pages</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-slate-600">{n.domain.name}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {n.storagePath ? (
                          <a
                            href={n.storagePath}
                            target="_blank"
                            className="flex items-center gap-1 text-[#1D64EC] hover:underline"
                          >
                            <FileText className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{n.originalFilename || "PDF"}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400">No file</span>
                        )}
                        {n.fileSize && (
                          <div className="text-slate-400 text-[10px]">{fmtBytes(n.fileSize)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            n.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {n.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-400">
                        {fmtDate(n.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setNoteModal(n)}
                            className="p-1.5 text-slate-500 hover:text-[#1D64EC] hover:bg-slate-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleNoteStatus(n)}
                            className="p-1.5 text-slate-500 hover:text-[#1D64EC] hover:bg-slate-100 rounded-lg transition"
                            title={n.status === "published" ? "Unpublish" : "Publish"}
                          >
                            {n.status === "published" ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Globe className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {n.storagePath && (
                            <a
                              href={n.storagePath}
                              target="_blank"
                              className="p-1.5 text-slate-500 hover:text-[#1D64EC] hover:bg-slate-100 rounded-lg transition"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => setDeleteTarget({ type: "note", item: n })}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete"
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

      {/* ── Domain Modal ── */}
      {domainModal !== false && (
        <DomainModal
          domain={domainModal}
          onClose={() => setDomainModal(false)}
          onSaved={(d) => {
            const existing = domains.find((x) => x.id === d.id);
            if (existing) {
              setDomains((prev) => prev.map((x) => (x.id === d.id ? { ...x, ...d } : x)));
              showToast("Domain updated ✓");
            } else {
              setDomains((prev) => [...prev, { ...d, _count: { notes: 0 } }]);
              setStats((s) => ({ ...s, totalDomains: s.totalDomains + 1 }));
              showToast("Domain created ✓");
            }
            setDomainModal(false);
          }}
        />
      )}

      {/* ── Note Modal ── */}
      {noteModal !== false && (
        <NoteModal
          note={noteModal}
          domains={domains}
          defaultDomainId={defaultDomainForNote}
          onClose={() => { setNoteModal(false); setDefaultDomainForNote(undefined); }}
          onSwitchToBulk={(files) => {
            setNoteModal(false);
            setBulkInitialFiles(files || []);
            setBulkModalOpen(true);
          }}
          onSaved={(n) => {
            const existing = notes.find((x) => x.id === n.id);
            if (existing) {
              setNotes((prev) => prev.map((x) => (x.id === n.id ? { ...x, ...n } : x)));
              showToast("Note updated ✓");
            } else {
              // Attach domain info
              const dom = domains.find((d) => d.id === n.domainId);
              const noteWithDomain = { ...n, domain: { name: dom?.name || "", slug: dom?.slug || "" } };
              setNotes((prev) => [noteWithDomain, ...prev]);
              setNotesLoaded(true);
              setStats((s) => ({
                ...s,
                totalNotes: s.totalNotes + 1,
                ...(n.status === "published"
                  ? { publishedNotes: s.publishedNotes + 1 }
                  : { draftNotes: s.draftNotes + 1 }),
              }));
              showToast(n.status === "published" ? "Note published ✓" : "Saved as draft ✓");
            }
            setNoteModal(false);
            setDefaultDomainForNote(undefined);
          }}
        />
      )}

      {/* ── Bulk Upload Modal ── */}
      {bulkModalOpen && (
        <BulkNotesUploadModal
          domains={domains}
          defaultDomainId={defaultDomainForNote}
          initialFiles={bulkInitialFiles}
          onClose={() => {
            setBulkModalOpen(false);
            setBulkInitialFiles([]);
            setDefaultDomainForNote(undefined);
          }}
          onSavedBatch={(newNotes) => {
            // Attach domain info to each note
            const notesWithDomain = newNotes.map((n) => {
              const dom = domains.find((d) => d.id === n.domainId);
              return { ...n, domain: { name: dom?.name || "", slug: dom?.slug || "" } };
            });
            setNotes((prev) => [...notesWithDomain, ...prev]);
            setNotesLoaded(true);
            const pubCount = newNotes.filter((n) => n.status === "published").length;
            const draftCount = newNotes.length - pubCount;
            setStats((s) => ({
              ...s,
              totalNotes: s.totalNotes + newNotes.length,
              publishedNotes: s.publishedNotes + pubCount,
              draftNotes: s.draftNotes + draftCount,
            }));
            showToast(`Batch completed: ${newNotes.length} notes added ✓`);
          }}
        />
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Delete {deleteTarget.type === "domain" ? "Domain" : "Note"}?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {deleteTarget.type === "domain"
                    ? `"${deleteTarget.item.name}" and all its notes will be permanently deleted.`
                    : `"${deleteTarget.item.title}" will be permanently deleted.`}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-slate-200 text-slate-700 rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 bg-rose-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
