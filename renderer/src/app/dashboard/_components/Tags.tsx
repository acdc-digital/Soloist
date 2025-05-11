// TAGS
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/Tags.tsx

"use client";

import React, { useState } from "react";
import { Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export type TagColors = 
  | "red" 
  | "green" 
  | "blue" 
  | "yellow" 
  | "purple" 
  | "pink" 
  | "orange" 
  | "cyan" 
  | "indigo";

export type Tag = {
  id: string;
  name: string;
  color: TagColors;
};

interface TagSelectorProps {
  onTagSelected: (tag: Tag) => void;
  existingTags?: Tag[];
}

export function TagSelector({ onTagSelected, existingTags = [] }: TagSelectorProps) {
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState<TagColors>("blue");
  const [open, setOpen] = useState(false);

  const COLORS: TagColors[] = [
    "red", "green", "blue", "yellow", "purple", "pink", "orange", "cyan", "indigo"
  ];

  const colorClasses: Record<TagColors, string> = {
    red: "bg-red-500 hover:bg-red-600",
    green: "bg-green-500 hover:bg-green-600",
    blue: "bg-blue-500 hover:bg-blue-600",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    purple: "bg-purple-500 hover:bg-purple-600",
    pink: "bg-pink-500 hover:bg-pink-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    cyan: "bg-cyan-500 hover:bg-cyan-600",
    indigo: "bg-indigo-500 hover:bg-indigo-600",
  };

  const handleAddTag = () => {
    if (tagName.trim()) {
      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        name: tagName.trim(),
        color: selectedColor,
      };
      onTagSelected(newTag);
      setTagName("");
      setOpen(false);
    }
  };

  const handleSelectExistingTag = (tag: Tag) => {
    onTagSelected(tag);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 gap-1 rounded-full px-2"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="text-xs">Tag</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Add a tag</h3>
          
          {/* Tag name input */}
          <div>
            <Input
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Tag name..."
              className="h-8 text-sm"
            />
          </div>
          
          {/* Color selector */}
          <div>
            <h4 className="text-xs mb-2 text-muted-foreground">Select color</h4>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full ${colorClasses[color]} flex items-center justify-center transition-all`}
                  aria-label={`Select ${color} color`}
                >
                  {selectedColor === color && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <h4 className="text-xs mb-2 text-muted-foreground">Preview</h4>
            <div className="flex items-center gap-2">
              <Badge
                className={`${colorClasses[selectedColor]} text-white`}
              >
                {tagName || "Tag preview"}
              </Badge>
            </div>
          </div>

          {/* Existing tags */}
          {existingTags.length > 0 && (
            <div>
              <h4 className="text-xs mb-2 text-muted-foreground">Existing tags</h4>
              <div className="flex flex-wrap gap-2">
                {existingTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className={`${colorClasses[tag.color]} text-white cursor-pointer`}
                    onClick={() => handleSelectExistingTag(tag)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddTag}
              disabled={!tagName.trim()}
            >
              Add Tag
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface TagBadgeProps {
  tag: Tag;
  onRemove?: (tagId: string) => void;
}

export function TagBadge({ tag, onRemove }: TagBadgeProps) {
  const colorClasses: Record<TagColors, string> = {
    red: "bg-red-500 hover:bg-red-600",
    green: "bg-green-500 hover:bg-green-600",
    blue: "bg-blue-500 hover:bg-blue-600",
    yellow: "bg-yellow-500 hover:bg-yellow-600",
    purple: "bg-purple-500 hover:bg-purple-600",
    pink: "bg-pink-500 hover:bg-pink-600",
    orange: "bg-orange-500 hover:bg-orange-600",
    cyan: "bg-cyan-500 hover:bg-cyan-600",
    indigo: "bg-indigo-500 hover:bg-indigo-600",
  };

  return (
    <Badge className={`${colorClasses[tag.color]} text-white gap-1`}>
      {tag.name}
      {onRemove && (
        <button 
          onClick={() => onRemove(tag.id)}
          className="ml-1 hover:bg-white/20 rounded-full"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove {tag.name} tag</span>
        </button>
      )}
    </Badge>
  );
}

