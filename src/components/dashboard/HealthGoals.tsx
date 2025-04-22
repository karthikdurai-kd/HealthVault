import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const HealthGoals = () => {
  const goals = [
    { id: 1, name: "Walk 10,000 steps", progress: 65, target: "10,000 steps", current: "6,500 steps" },
    { id: 2, name: "Drink water", progress: 80, target: "8 glasses", current: "6 glasses" },
    { id: 3, name: "Sleep", progress: 90, target: "8 hours", current: "7.2 hours" },
    { id: 4, name: "Meditation", progress: 50, target: "20 mins", current: "10 mins" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-health-blue-600" />
          Today's Health Goals
        </CardTitle>
        <CardDescription className="text-xs">
          Track your daily health targets
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-3">
        <div className="space-y-3">
          {goals.map((goal) => (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${goal.progress === 100 ? "text-green-500" : "text-muted-foreground"}`} />
                  <p className="text-sm font-medium">{goal.name}</p>
                </div>
                <span className="text-xs font-medium">{goal.progress}%</span>
              </div>
              <div className="space-y-1">
                <Progress value={goal.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Current: {goal.current}</span>
                  <span>Target: {goal.target}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthGoals;