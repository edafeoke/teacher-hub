import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus,
  Search,
  MessageSquare,
  CalendarCheck,
} from "lucide-react";

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Create Your Profile",
    description:
      "Sign up as a teacher or student. Build your profile with your expertise, interests, and learning goals.",
  },
  {
    step: 2,
    icon: Search,
    title: "Find Your Match",
    description:
      "Our smart matching algorithm connects you with the perfect teacher or student based on your preferences.",
  },
  {
    step: 3,
    icon: MessageSquare,
    title: "Connect & Communicate",
    description:
      "Start conversations, discuss learning objectives, and plan your educational journey together.",
  },
  {
    step: 4,
    icon: CalendarCheck,
    title: "Schedule Sessions",
    description:
      "Book sessions, track progress, and build a lasting educational relationship.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">
            Simple Process
          </Badge>
          <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Getting started is easy. Follow these simple steps to begin your
            educational journey.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.step}
                className="group border-border/50 bg-card shadow-sm transition-all hover:shadow-md"
              >
                <CardHeader className="pb-3">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Icon className="text-primary size-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Step {step.step}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

