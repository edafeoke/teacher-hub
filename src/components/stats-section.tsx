import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, Calendar, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10K+",
    label: "Active Teachers",
    description: "Experienced educators ready to teach",
  },
  {
    icon: GraduationCap,
    value: "50K+",
    label: "Students",
    description: "Learners finding their perfect match",
  },
  {
    icon: Calendar,
    value: "100K+",
    label: "Sessions Completed",
    description: "Successful learning sessions delivered",
  },
  {
    icon: TrendingUp,
    value: "98%",
    label: "Satisfaction Rate",
    description: "Happy teachers and students",
  },
];

export default function StatsSection() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">
            Trusted Platform
          </Badge>
          <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">
            Join Thousands of Educators and Learners
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Our platform connects passionate teachers with eager students,
            creating meaningful educational experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group border-border/50 bg-card shadow-sm transition-all hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-center">
                    <div className="bg-primary/10 rounded-full p-3">
                      <Icon className="text-primary size-6" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold md:text-4xl">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground mt-2 text-sm font-medium">
                      {stat.label}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {stat.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

