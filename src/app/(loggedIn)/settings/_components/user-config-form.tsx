import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { UserConfig } from "@/server/db/schema";
import { api } from "@/trpc/server";
import { User } from "lucide-react";
import { revalidatePath } from "next/cache";

//Example: https://github.com/t3dotgg/server-actions-trpc-examples/blob/main/src/app/rsc-trpc-action/page.tsx
export async function UserConfigForm() {
  const userConfig = await api.userConfig.getUserConfig();

  return (
    <form
      action={async (formData) => {
        "use server";
        const config = Object.fromEntries(formData);
        await api.userConfig.create(config as unknown as UserConfig);
        revalidatePath("/settings");
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Basic information used for calculating your metabolic needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={userConfig?.age ?? 28}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <RadioGroup
                name="gender"
                value={userConfig?.gender ?? "male"}
                className="flex space-x-4"
                required
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="weight">Weight</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="weight-unit" className="text-sm">
                    kg
                  </Label>
                  <Switch
                    id="weight-unit"
                    checked={userConfig?.weightUnit === "lbs"}
                  />
                  <Label htmlFor="weight-unit" className="text-sm">
                    lbs
                  </Label>
                </div>
              </div>
              <Input
                id="weight"
                type="number"
                step="0.1"
                name="weight"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="height">Height</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="height-unit" className="text-sm">
                    cm
                  </Label>
                  <Switch
                    id="height-unit"
                    checked={userConfig?.heightUnit === "ft"}
                  />
                  <Label htmlFor="height-unit" className="text-sm">
                    ft
                  </Label>
                </div>
              </div>
              <Input
                id="height"
                type="number"
                step="0.1"
                name="height"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Activity Level</Label>
            <Select
              name="activityLevel"
              value={userConfig?.activityLevel ?? "lightly_active"}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">
                  Sedentary (little/no exercise)
                </SelectItem>
                <SelectItem value="lightly_active">
                  Lightly Active (light exercise 1-3 days/week)
                </SelectItem>
                <SelectItem value="moderately_active">
                  Moderately Active (moderate exercise 3-5 days/week)
                </SelectItem>
                <SelectItem value="very_active">
                  Very Active (hard exercise 6-7 days/week)
                </SelectItem>
                <SelectItem value="extremely_active">
                  Extremely Active (very hard exercise, physical job)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
