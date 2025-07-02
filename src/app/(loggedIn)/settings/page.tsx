import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalForm } from "./_components/goal-form";
import { SidePanel } from "./_components/side-panel";
import { TrainingConfigForm } from "./_components/training-config-form";
import { UserConfigForm } from "./_components/user-config-form";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

const validTabs = ["personal", "goals", "training"];

export default async function UserSettings({
  searchParams,
}: {
  searchParams?: {
    tab?: string;
  };
}) {
  const userConfig = await api.userConfig.getUserConfig();
  const goals = await api.userGoal.getUserGoal();
  const trainingConfig = await api.trainingConfig.getTrainingConfig();

  // params in nextjs should be awaited
  // eslint-disable-next-line @typescript-eslint/await-thenable
  const params = await searchParams;
  const tab = params?.tab ?? "personal";

  const activeTab = tab && validTabs.includes(tab) ? tab : "personal";

  if (userConfig !== null && goals === null) {
    redirect("/settings?tab=goals");
  } else if (userConfig !== null && goals !== null && trainingConfig === null) {
    redirect("/settings?tab=training");
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <main className="container flex-1 py-6">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Configure your profile to get personalized workout and nutrition
              recommendations.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Settings Form */}
            <div className="lg:col-span-2">
              <Tabs defaultValue={activeTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                  <TabsTrigger value="training">Training</TabsTrigger>
                </TabsList>

                {/* Personal Information */}
                <TabsContent value="personal" className="space-y-6">
                  <UserConfigForm userConfig={userConfig} />
                </TabsContent>

                {/* Goals */}
                <TabsContent value="goals" className="space-y-6">
                  <GoalForm goals={goals} userConfig={userConfig} />
                </TabsContent>

                {/* Training */}
                <TabsContent value="training" className="space-y-6">
                  <TrainingConfigForm trainingConfig={trainingConfig} />
                </TabsContent>
              </Tabs>
            </div>

            <SidePanel />
          </div>
        </div>
      </main>
    </div>
  );
}
