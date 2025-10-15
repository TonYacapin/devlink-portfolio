import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio, avatar_url")
    .eq("username", params.username)
    .single()

  if (!profile) notFound()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <img
        src={profile.avatar_url || "/default-avatar.png"}
        className="w-20 h-20 rounded-full mb-4"
        alt={`${profile.username}'s avatar`}
      />
      <h1 className="text-3xl font-bold">@{profile.username}</h1>
      <p className="text-lg text-muted-foreground">{profile.display_name}</p>
      <p className="mt-4 text-sm text-center max-w-md text-muted-foreground">{profile.bio}</p>
    </div>
  )
}
