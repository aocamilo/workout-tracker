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
import type { UserGoal } from "@/server/db/schema";
import { api } from "@/trpc/server";
import { revalidatePath } from "next/cache";

import { Target } from "lucide-react";
import SaveFormButton from "./save-form-button";

export async function GoalForm() {
  const goals = await api.userGoal.getUserGoal();
  const userConfig = await api.userConfig.getUserConfig();

  return (
    <form
      id="goal-form"
      action={async (formData) => {
        "use server";
        const config = Object.fromEntries(formData);
        await api.userGoal.create(config as unknown as UserGoal);
        revalidatePath("/settings");
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Fitness Goals
          </CardTitle>
          <CardDescription>
            Define your primary fitness objective and target metrics.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Primary Goal</Label>
            <RadioGroup
              name="primaryGoal"
              required
              defaultValue={goals?.primaryGoal}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="lose_weight" id="lose_weight" />
                <Label htmlFor="lose_weight" className="flex-1">
                  <div>
                    <p className="font-medium">Lose Weight</p>
                    <p className="text-muted-foreground text-sm">
                      Reduce body fat and overall weight
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="gain_muscle" id="gain_muscle" />
                <Label htmlFor="gain_muscle" className="flex-1">
                  <div>
                    <p className="font-medium">Gain Muscle</p>
                    <p className="text-muted-foreground text-sm">
                      Build lean muscle mass
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="maintain" id="maintain" />
                <Label htmlFor="maintain" className="flex-1">
                  <div>
                    <p className="font-medium">Maintain Weight</p>
                    <p className="text-muted-foreground text-sm">
                      Stay at current weight
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem
                  value="improve_endurance"
                  id="improve_endurance"
                />
                <Label htmlFor="improve_endurance" className="flex-1">
                  <div>
                    <p className="font-medium">Improve Endurance</p>
                    <p className="text-muted-foreground text-sm">
                      Enhance cardiovascular fitness
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3">
                <RadioGroupItem value="general_fitness" id="general_fitness" />
                <Label htmlFor="general_fitness" className="flex-1">
                  <div>
                    <p className="font-medium">General Fitness</p>
                    <p className="text-muted-foreground text-sm">
                      Overall health and wellness
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {(goals?.primaryGoal === "lose_weight" ||
            goals?.primaryGoal === "gain_muscle") && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target-weight">
                  Target Weight ({userConfig?.weightUnit})
                </Label>
                <Input
                  name="targetWeight"
                  id="target-weight"
                  type="number"
                  step="0.1"
                  defaultValue={goals?.targetWeight}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-date">Target Date (Optional)</Label>
                <Input
                  id="target-date"
                  type="date"
                  name="targetDate"
                  defaultValue={goals?.targetDate.toISOString().split("T")[0]}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <SaveFormButton form="goal-form" />
    </form>
  );
}
