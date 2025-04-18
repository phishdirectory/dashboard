"use client";

import type React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { CheckCircle2, Search, Shield, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Metrics = {
  totalChecks: number;
  totalDomains: number;
  totalUsers: number;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [domainToCheck, setDomainToCheck] = useState("");
  const [domainResult, setDomainResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiRequest<Metrics>("/misc/metrics", {
          requiresAuth: true,
        });
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const handleDomainCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainToCheck) return;

    setIsChecking(true);
    setDomainResult(null);

    try {
      const data = await apiRequest(
        `/domain/check?domain=${encodeURIComponent(domainToCheck)}`,
        {
          requiresAuth: true,
        }
      );
      setDomainResult(data);
    } catch (error) {
      console.error("Failed to check domain:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome{user ? `, ${user.email}` : ""} to the Phish Directory
          dashboard
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domain-check">Domain Check</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Checks
                </CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading
                    ? "Loading..."
                    : metrics?.totalChecks?.toString() || "0"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Domains
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading
                    ? "Loading..."
                    : metrics?.totalDomains?.toString() || "0"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading
                    ? "Loading..."
                    : metrics?.totalUsers?.toString() || "0"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About Phish Directory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Phish Directory is a community-driven database of phishing URLs.
                Our goal is to help you stay safe from phishing attacks by
                providing you with the latest information on phishing URLs.
              </p>
              <p>
                Use the dashboard to check domains, verify email addresses, and
                access adblock lists to protect yourself from phishing attacks.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="domain-check" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Check a Domain</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDomainCheck} className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="domain"
                      placeholder="example.com"
                      value={domainToCheck}
                      onChange={(e) => setDomainToCheck(e.target.value)}
                    />
                    <Button type="submit" disabled={isChecking}>
                      {isChecking ? "Checking..." : "Check"}
                    </Button>
                  </div>
                </div>
              </form>

              {domainResult && (
                <div className="mt-4">
                  {domainResult.isPhishing ? (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Phishing Detected</AlertTitle>
                      <AlertDescription>
                        This domain has been identified as a phishing site.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert
                      variant="default"
                      className="border-green-500 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>Safe Domain</AlertTitle>
                      <AlertDescription>
                        This domain has not been identified as a phishing site.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
