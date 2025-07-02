"use client";

import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

export default function SaveFormButton({
  form,
  isPending,
}: {
  form: string;
  isPending?: boolean;
}) {
  return (
    <div className="flex justify-end">
      <Button
        type="submit"
        className="mt-4 flex cursor-pointer items-center gap-2"
        form={form}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isPending ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}
