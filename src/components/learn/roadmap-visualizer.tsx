import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type RoadmapStep = {
  id: string;
  title: string;
  description: string;
  order: number;
  type: string;
  pageSlug: string | null;
  estimatedTime: string | null;
  milestone: string | null;
  isCompleted: boolean;
};

type RoadmapVisualizerProps = {
  steps: RoadmapStep[];
  onToggleComplete?: (id: string) => void | Promise<void>;
};

export function RoadmapVisualizer({ steps, onToggleComplete }: RoadmapVisualizerProps) {
  const orderedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {orderedSteps.map((step, index) => (
        <div key={step.id} className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Step {index + 1}</Badge>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <Badge variant="outline" className="capitalize">
                  {step.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {step.pageSlug && <span>Page: {step.pageSlug}</span>}
                {step.estimatedTime && <span>Estimated: {step.estimatedTime}</span>}
                {step.milestone && <span>Milestone: {step.milestone}</span>}
              </div>
            </div>
            {onToggleComplete && (
              <Button
                variant={step.isCompleted ? "secondary" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={() => onToggleComplete(step.id)}
                disabled={step.isCompleted}
              >
                {step.isCompleted ? "Completed" : "Mark Complete"}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
