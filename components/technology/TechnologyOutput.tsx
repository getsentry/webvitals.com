import type { TechnologyDetectionOutput } from "@/types/web-vitals";

interface TechnologyOutputProps {
  output: TechnologyDetectionOutput;
}

export default function TechnologyOutput({ output }: TechnologyOutputProps) {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">
        Detected Technologies ({output.summary.totalDetected})
      </h3>

      {Object.keys(output.summary.byCategory).length > 0 && (
        <div className="space-y-3">
          {Object.entries(output.summary.byCategory).map(
            ([category, techs]) => (
              <div key={category} className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {techs.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
