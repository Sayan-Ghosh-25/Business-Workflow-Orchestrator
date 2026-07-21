"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, FileText, Bot, CheckCircle2, BarChart3, ArrowRight, Zap, Lock, Clock } from "lucide-react";

const FEATURES = [
  {
    icon: <Bot className="h-6 w-6" />,
    title: "AI-Powered Extraction",
    description: "Intelligent document processing with field extraction, confidence scoring, and automated routing.",
  },
  {
    icon: <CheckCircle2 className="h-6 w-6" />,
    title: "Smart Approval Workflows",
    description: "HIL-governed approval chains with role-based routing, threshold-based auto-approval, and audit compliance.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Real-Time Metrics",
    description: "Track automation ROI, turnaround times, and approval rates with comprehensive dashboards.",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Enterprise Compliance",
    description: "Full audit trail, version history, and role-based access control for regulatory compliance.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Automated Processing",
    description: "High-confidence documents auto-approved instantly, reducing manual workload by up to 60%.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Faster Turnaround",
    description: "Average processing time under 3 hours, with AI extraction completing in under 60 seconds.",
  },
];

const STATS = [
  { value: "60%", label: "Auto-Approval Rate" },
  { value: "< 3hrs", label: "Avg Turnaround" },
  { value: "312hrs", label: "Time Saved" },
  { value: "99.9%", label: "Uptime SLA" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-8xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">Business AI Orchestrator</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="text-xs font-medium text-muted-foreground">Enterprise-Grade AI Document Processing</span>
          </div>
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground lg:text-6xl">
          Business AI Workflow Orchestrator
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Streamline document workflows with intelligent AI extraction, automated approval routing, and complete audit compliance. Built for enterprise teams.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild className="gap-2">
              <Link href="/auth/signup">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">Sign In to Console</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card px-4 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground lg:text-3xl">Built for Enterprise Document Workflows</h2>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground leading-relaxed">
              From invoice processing to contract review, automate every step with AI-powered intelligence and Human-in-the-Loop governance.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border border-border transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="border-t border-border bg-card px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold text-foreground">How It Works</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: "01", title: "Upload", desc: "Upload PDF documents with project metadata" },
              { step: "02", title: "AI Extract", desc: "AI processes and extracts fields with confidence scores" },
              { step: "03", title: "Review", desc: "Approve, edit, or route for manual review" },
              { step: "04", title: "Commit", desc: "Auto-commit with full audit trail" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Ready to Transform Your Document Workflows?</h2>
          <p className="mb-8 text-sm text-muted-foreground">Join enterprise teams automating document processing with Business AI Workflow Orchestrator.</p>
          <Button size="lg" asChild className="gap-2">
            <Link href="/auth/signup">Get Started Now <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Business AI Workflow Orchestrator &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
