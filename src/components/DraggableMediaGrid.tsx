import { useState, useRef } from "react";
import { X, Plus, Loader2, GripVertical } from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  type: string;
  storage_path: string | null;
}

interface DraggableMediaGridProps {
  items: MediaItem[];
  type: "image" | "video";
  maxItems: number;
  maxSizeLabel: string;
  accept: string;
  uploading: boolean;
  onUpload: (file: File) => void;
  onDelete: (id: string, storagePath: string | null) => void;
  onReorder: (reorderedIds: string[]) => void;
}

const DraggableMediaGrid = ({
  items,
  type,
  maxItems,
  maxSizeLabel,
  accept,
  uploading,
  onUpload,
  onDelete,
  onReorder,
}: DraggableMediaGridProps) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragCounter = useRef<Record<number, number>>({});

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // For Firefox
    e.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragCounter.current[index] = (dragCounter.current[index] || 0) + 1;
    if (index !== dragIndex) setOverIndex(index);
  };

  const handleDragLeave = (_e: React.DragEvent, index: number) => {
    dragCounter.current[index] = (dragCounter.current[index] || 0) - 1;
    if (dragCounter.current[index] <= 0) {
      dragCounter.current[index] = 0;
      if (overIndex === index) setOverIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    dragCounter.current = {};
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const reordered = [...items];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);
    onReorder(reordered.map((item) => item.id));
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setOverIndex(null);
    dragCounter.current = {};
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnter={(e) => handleDragEnter(e, index)}
          onDragLeave={(e) => handleDragLeave(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`relative aspect-square rounded-xl border overflow-hidden group cursor-grab active:cursor-grabbing transition-all ${
            dragIndex === index
              ? "opacity-40 scale-95 border-primary"
              : overIndex === index
              ? "ring-2 ring-primary border-primary scale-105"
              : "border-border"
          }`}
        >
          {type === "image" ? (
            <img src={item.url} alt="" className="w-full h-full object-cover pointer-events-none" />
          ) : (
            <video src={item.url} className="w-full h-full object-cover pointer-events-none" />
          )}
          {/* Grip handle */}
          <div className="absolute top-2 left-2 p-1 rounded-full bg-background/70 text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-3 w-3" />
          </div>
          <button
            onClick={() => onDelete(item.id, item.storage_path)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      {items.length < maxItems && (
        <label className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <>
              <Plus className="h-6 w-6 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">Add {type}</span>
              <span className="text-[10px] text-muted-foreground">{maxSizeLabel}</span>
            </>
          )}
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
        </label>
      )}
    </div>
  );
};

export default DraggableMediaGrid;
