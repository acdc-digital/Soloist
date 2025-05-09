// SYSTEM ATTRIBUTES
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/settings/_components/Attributes.tsx

"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useUserContext } from "@/provider/userContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";

interface AttributesForm {
  name: string;
  goals: string;
  objectives: string;
}

export default function Attributes() {
  const { user } = useUserContext();
  const userId = user?.id || user?.authId || user?._id || '';

  const attributesDoc = useQuery(
    api.userAttributes.getAttributes,
    userId ? { userId } : "skip"
  );
  const setAttributes = useMutation(api.userAttributes.setAttributes);

  const [form, setForm] = useState<AttributesForm>({
    name: attributesDoc?.attributes?.name || "",
    goals: attributesDoc?.attributes?.goals || "",
    objectives: attributesDoc?.attributes?.objectives || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update form when attributesDoc changes
  useEffect(() => {
    if (attributesDoc?.attributes) {
      setForm({
        name: attributesDoc.attributes.name || "",
        goals: attributesDoc.attributes.goals || "",
        objectives: attributesDoc.attributes.objectives || "",
      });
    }
  }, [attributesDoc]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await setAttributes({ userId, attributes: form });
      setSaveSuccess(true);
      // Reset success indicator after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save attributes:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium mb-1">Your Personal Attributes</h3>
      <p className="text-xs text-muted-foreground mb-2">
        These details help personalize your experience and can be used for AI-generated content.
      </p>
      
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="name" className="text-xs font-medium">
            Name
          </label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="h-8 text-sm"
          />
        </div>
        
        <div className="space-y-1">
          <label htmlFor="goals" className="text-xs font-medium">
            Goals
          </label>
          <Textarea
            id="goals"
            name="goals"
            value={form.goals}
            onChange={handleChange}
            placeholder="What are your goals?"
            className="text-sm resize-none min-h-[60px]"
            rows={2}
          />
        </div>
        
        <div className="space-y-1">
          <label htmlFor="objectives" className="text-xs font-medium">
            Objectives
          </label>
          <Textarea
            id="objectives"
            name="objectives"
            value={form.objectives}
            onChange={handleChange}
            placeholder="What are your objectives?"
            className="text-sm resize-none min-h-[60px]"
            rows={2}
          />
        </div>
      </div>
      
      <div className="pt-1">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          size="sm"
          variant="outline"
          className="flex gap-1 items-center h-7 text-xs"
        >
          {saving ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-green-500" />
              Saved!
            </>
          ) : (
            "Save Attributes"
          )}
        </Button>
      </div>
    </div>
  );
}

