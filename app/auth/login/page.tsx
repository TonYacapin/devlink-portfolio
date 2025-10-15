"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Code2, Loader2, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    setIsSuccess(false)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      // Show success state immediately
      setIsSuccess(true)
      
      // Force refresh the router and navigate
      router.refresh()
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
      
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 justify-center">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DevLink</span>
          </Link>
          
          {/* Success State */}
          {isSuccess ? (
            <Card className="border-2 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in duration-300" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-green-600">Login Successful!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Redirecting to dashboard...
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : 
          /* Loading State */
          isLoading ? (
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">Authenticating</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Verifying your credentials...
                    </p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Normal Login Form */
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="developer@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="underline underline-offset-4 text-primary">
                      Sign up
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}