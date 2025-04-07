// DASHBOARD
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/page.tsx

"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@/hooks/useUser";
import { signOut } from "../../../convex/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardIcon, GearIcon, PersonIcon } from "@radix-ui/react-icons";

import { useUserStore } from "@/store/userStore";
import { useEffect } from "react";
import Sidebar from "./_components/sidebar";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useUser();
  const setStoreUser = useUserStore((state) => state.setUser);
  
  // Sync Convex user with our store
  useEffect(() => {
    if (user) {
      setStoreUser({
        id: user.id || "",
        name: user.name || "",
        email: user.email || "",
        profilePicture: user.imageUrl
      });
    }
  }, [user, setStoreUser]);

  const handleSignOut = async () => {
    await signOut();
    useUserStore.getState().signOut();
  };

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dashboard Overview</CardTitle>
                    <CardDescription>
                      Welcome to your dashboard! This is a boilerplate that you can customize.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {/* Stat cards */}
                      {[1, 2, 3].map((i) => (
                        <Card key={i}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">
                              {["Total Users", "Active Projects", "Revenue"][i-1]}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {["254", "12", "$12,543"][i-1]}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {["+12% from last month", "2 added this week", "+22% from last quarter"][i-1]}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <div className="text-xs text-muted-foreground">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>
                      View detailed analytics for your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full rounded-md border border-dashed flex items-center justify-center">
                      <p className="text-muted-foreground">Analytics charts will render here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reports" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>
                      Generated reports and data exports.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 w-full rounded-md border border-dashed flex items-center justify-center">
                      <p className="text-muted-foreground">Reports will be listed here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}