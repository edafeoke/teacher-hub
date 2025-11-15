import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Rocket } from 'lucide-react'

export default function CallToAction() {
    return (
        <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <Badge variant="outline" className="mb-4">
                        Ready to Start?
                    </Badge>
                    <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">
                        Join the TeacherHub Community Today
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
                        Connect with passionate educators and eager learners. Start your educational journey and make a difference.
                    </p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <Button
                            asChild
                            size="lg">
                            <Link href="/register">
                                <Rocket className="size-4" />
                                <span>Get Started Free</span>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline">
                            <Link href="/login">
                                <span>Sign In</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
