import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientSignInButton } from "@/components/SignInButtons";

export default async function HomePage() {
  // Check if user is authenticated and redirect to dashboard
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground">
              Master Your Learning with <span className="text-primary">Flashy Cardy</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create, organize, and study flashcards efficiently. Track your progress and 
              boost your memory with our intuitive flashcard application.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <ClientSignInButton size="lg" className="text-lg px-8 py-3">
              Get Started
            </ClientSignInButton>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything you need to study effectively
          </h2>
          <p className="text-muted-foreground">
            Powerful features designed to enhance your learning experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  📚
                </div>
                Organize Decks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create and organize flashcard decks by subject, topic, or difficulty level.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  🎯
                </div>
                Smart Study
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Study efficiently with spaced repetition and progress tracking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                  📊
                </div>
                Track Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor your learning progress with detailed statistics and insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 border-y border-primary/20">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to start learning?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of learners who are already using Flashy Cardy to master new skills.
          </p>
          <ClientSignInButton size="lg">
            Start Learning Today
          </ClientSignInButton>
        </div>
      </div>
    </div>
  );
}
