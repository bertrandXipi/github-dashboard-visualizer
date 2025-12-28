import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Github className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">GitHub Activity Tracker</CardTitle>
          <CardDescription>
            Suivez et visualisez votre activité GitHub
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Connectez-vous avec votre compte GitHub pour commencer à suivre votre activité de développement.
          </p>
          <Button className="w-full" size="lg">
            <Github className="mr-2 h-4 w-4" />
            Se connecter avec GitHub
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
