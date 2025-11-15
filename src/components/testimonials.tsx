import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Math Teacher",
    image: "",
    initials: "SJ",
    content:
      "TeacherHub has transformed how I connect with students. The matching system is incredible, and I've found students who are truly passionate about learning.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Student",
    image: "",
    initials: "MC",
    content:
      "I found the perfect chemistry tutor through TeacherHub. The platform made it so easy to find someone who matched my learning style and schedule.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Language Teacher",
    image: "",
    initials: "ER",
    content:
      "As a Spanish teacher, I love how TeacherHub helps me reach students who are genuinely interested in learning. The communication tools are excellent.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Student",
    image: "",
    initials: "DK",
    content:
      "The best part about TeacherHub is the quality of teachers. I've improved my grades significantly thanks to the personalized attention I receive.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-background py-16 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4">
            Testimonials
          </Badge>
          <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">
            What Our Community Says
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Hear from teachers and students who are building meaningful
            educational connections.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group border-border/50 bg-card shadow-sm transition-all hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="text-yellow-400 fill-yellow-400 size-4"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

