import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, BarChart3, MessageSquare } from 'lucide-react'
import { ReactNode } from 'react'

const features = [
    {
        icon: Users,
        title: "Smart Matching",
        description: "Our intelligent algorithm connects teachers and students based on learning styles, subjects, and availability for the perfect match.",
    },
    {
        icon: Calendar,
        title: "Session Management",
        description: "Easily schedule, reschedule, and manage your learning sessions with our intuitive calendar system.",
    },
    {
        icon: BarChart3,
        title: "Progress Tracking",
        description: "Monitor learning progress with detailed analytics and insights to help both teachers and students achieve their goals.",
    },
    {
        icon: MessageSquare,
        title: "Secure Communication",
        description: "Communicate safely through our built-in messaging system with end-to-end encryption and moderation tools.",
    },
]

export default function Features() {
    return (
        <section id="features" className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
            <div className="@container mx-auto max-w-7xl px-6">
                <div className="text-center">
                    <Badge variant="outline" className="mb-4">
                        Features
                    </Badge>
                    <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">Built for Teachers and Students</h2>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">Everything you need to create meaningful educational connections and successful learning experiences.</p>
                </div>
                <div className="@min-4xl:max-w-full @min-4xl:grid-cols-4 mx-auto mt-8 grid max-w-sm gap-6 md:grid-cols-2 md:mt-16 lg:grid-cols-4">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <Card key={index} className="group shadow-zinc-950/5 border-border/50">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                        <Icon
                                    className="size-6"
                                    aria-hidden
                                />
                            </CardDecorator>

                                    <h3 className="mt-6 font-semibold">{feature.title}</h3>
                        </CardHeader>

                        <CardContent>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                        </CardContent>
                    </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
        />

        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)
