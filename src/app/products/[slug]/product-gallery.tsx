"use client";

import { useState } from "react";

interface GalleryMedia {
  id: string;
  media: { url: string; alt_text: string | null };
  is_primary: boolean;
}

export function ProductGallery({ media, productName }: { media: GalleryMedia[]; productName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = media[selectedIndex] || media[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted feature-card group">
        {selected ? (
          <img
            src={selected.media.url}
            alt={selected.media.alt_text || productName}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-secondary/40 text-sm">
            No Image Available
          </div>
        )}
      </div>
      {media.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {media.map((pm, i) => (
            <button
              key={pm.id}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={`aspect-square overflow-hidden rounded-xl bg-muted feature-card cursor-pointer transition-all duration-200 ${
                i === selectedIndex
                  ? "ring-2 ring-accent ring-offset-2 opacity-100"
                  : "opacity-60 hover:opacity-90"
              }`}
            >
              <img
                src={pm.media.url}
                alt={pm.media.alt_text || ""}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
