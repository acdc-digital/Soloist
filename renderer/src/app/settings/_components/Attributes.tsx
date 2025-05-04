// SYSTEM ATTRIBUTES
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/settings/_components/Attributes.tsx

"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/provider/userContext";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Attributes() {
  const { user } = useUserContext();
  const userId = user?.id || user?.authId || user?._id;

  const attributesDoc = useQuery(
    api.userAttributes.getAttributes,
    userId ? { userId } : "skip"
  );
  const setAttributes = useMutation(api.userAttributes.setAttributes);

  const [form, setForm] = useState({
    name: attributesDoc?.attributes?.name || "",
    goals: attributesDoc?.attributes?.goals || "",
    objectives: attributesDoc?.attributes?.objectives || "",
  });
  const [saving, setSaving] = useState(false);

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

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await setAttributes({ userId, attributes: form });
    setSaving(false);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold">Your Attributes</h2>
      <Input
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Your name"
      />
      <Textarea
        label="Goals"
        name="goals"
        value={form.goals}
        onChange={handleChange}
        placeholder="What are your goals?"
      />
      <Textarea
        label="Objectives"
        name="objectives"
        value={form.objectives}
        onChange={handleChange}
        placeholder="What are your objectives?"
      />
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}

