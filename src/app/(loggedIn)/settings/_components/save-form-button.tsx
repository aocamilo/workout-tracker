"use client";

import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export default function SaveFormButton({ form }: { form: string }) {
  const { pending } = useFormStatus();

  return (
    <div className="flex justify-end">
      <Button
        type="submit"
        className="mt-4 flex cursor-pointer items-center gap-2"
        form={form}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {pending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
