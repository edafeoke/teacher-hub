import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Users } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Marketplace</h1>
            <p className="text-lg text-muted-foreground">
              Connect teachers and students through our marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Expertise Advertisements</CardTitle>
                <CardDescription>
                  Browse teacher expertise advertisements to find the perfect tutor for your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/marketplace/expertise">Browse Expertise Ads</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Learning Needs</CardTitle>
                <CardDescription>
                  Browse student learning need advertisements to find students looking for teachers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/marketplace/learning-needs">Browse Learning Needs</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <FooterSection />
    </div>
  );
}

