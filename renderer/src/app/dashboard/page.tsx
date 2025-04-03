"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@/hooks/useUser";
import { signOut } from "../../../convex/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardIcon, GearIcon, PersonIcon, ExitIcon } from "@radix-ui/react-icons";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useUser();
  
  // Example query - replace with your actual Convex query
  // const data = useQuery(api.documents.list);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <DashboardIcon className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Your App</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">
                  {user.name || user.email || "User"}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleSignOut}
                  title="Sign out"
                >
                  <ExitIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <PersonIcon className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <GearIcon className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </div>
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
          
          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  Create New Project
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  Invite Team Member
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  View Reports
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <div>Project {i} updated</div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {i}h ago
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="border-t px-6 py-2">
                <Button variant="ghost" size="sm" className="w-full justify-center">
                  View All
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}