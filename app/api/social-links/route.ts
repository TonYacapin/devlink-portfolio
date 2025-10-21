import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      platform,
      url,
      display_text,
      display_order,
      is_active
    } = body

    if (!platform || !url) {
      return NextResponse.json(
        { error: "Platform and URL are required" },
        { status: 400 }
      )
    }

    const { data: socialLink, error } = await supabase
      .from("social_links")
      .insert([
        {
          platform,
          url,
          display_text: display_text || null,
          display_order: display_order || 0,
          is_active: is_active !== false,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating social link:", error)
      return NextResponse.json(
        { error: "Failed to create social link" },
        { status: 500 }
      )
    }

    return NextResponse.json(socialLink, { status: 201 })
  } catch (error) {
    console.error("Error in social links API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: socialLinks, error } = await supabase
      .from("social_links")
      .select("*")
      .eq("user_id", user.id)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching social links:", error)
      return NextResponse.json(
        { error: "Failed to fetch social links" },
        { status: 500 }
      )
    }

    return NextResponse.json(socialLinks || [])
  } catch (error) {
    console.error("Error in social links API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}