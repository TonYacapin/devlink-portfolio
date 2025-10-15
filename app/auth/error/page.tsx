import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code2, AlertCircle } from "lucide-react"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 justify-center">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">DevLink</span>
          </Link>
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4 mx-auto">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-center">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {params?.error_description ? (
                <p className="text-sm text-muted-foreground mb-6">{params.error_description}</p>
              ) : params?.error ? (
                <p className="text-sm text-muted-foreground mb-6">Error code: {params.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground mb-6">
                  An unexpected error occurred during authentication.
                </p>
              )}
              <Link href="/auth/login">
                <Button className="w-full">Back to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
