// LANDING PAGE
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/page.tsx

'use client'

import { SignInWithGitHub } from "@/auth/oath/SignInWithGitHub";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DraggableHeader from "./dashboard/_components/DraggableHeader";

export default function LandingPage() {
  return (
    <div>
      <div>
      <DraggableHeader />
      </div>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
              <CardDescription>Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SignInWithGitHub />
            </CardContent>
            <CardFooter className="text-center text-sm text-muted-foreground">
              <p>Secured authentication with Convex Auth</p>
            </CardFooter>
          </Card>
        </div>
    </div>
  );
}