import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, ExternalLink, Github } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  console.log("Looking for username:", username)

  // First, get the profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url")
    .eq("username", username)
    .single()

  console.log("Profile query result:", { profile, profileError })

  if (!profile) {
    console.log("Profile not found, showing 404")
    notFound()
  }

  // Then, get projects for this user using separate query
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", profile.id)
    .order("display_order", { ascending: true })
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })

  console.log("Projects query result:", { 
    projectsCount: projects?.length, 
    projectsError 
  })

  // Get skills for this user
  const { data: skills, error: skillsError } = await supabase
    .from("skills")
    .select("*")
    .eq("user_id", profile.id)
    .order("proficiency_level", { ascending: false })
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true })

  console.log("Skills query result:", { 
    skillsCount: skills?.length, 
    skillsError 
  })

  // Get blog posts for this user (only published ones)
  const { data: blogPosts, error: blogPostsError } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(3)

  console.log("Blog posts query result:", { 
    blogPostsCount: blogPosts?.length, 
    blogPostsError 
  })

  // Get social links for this user (only active ones)
  const { data: socialLinks, error: socialLinksError } = await supabase
    .from("social_links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  console.log("Social links query result:", { 
    socialLinksCount: socialLinks?.length, 
    socialLinksError 
  })

  // Sort projects by featured status and display order
  const sortedProjects = (projects || [])
    .sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1
      if (!a.is_featured && b.is_featured) return 1
      return a.display_order - b.display_order
    })

  // Group skills by category
  const skillsByCategory = (skills || []).reduce((acc: Record<string, any[]>, skill: any) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, any[]>)

  // Platform names for display
  const PLATFORM_NAMES: { [key: string]: string } = {
    github: "GitHub",
    twitter: "Twitter",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    instagram: "Instagram",
    facebook: "Facebook",
    twitch: "Twitch",
    discord: "Discord",
    website: "Website",
    portfolio: "Portfolio",
    blog: "Blog",
    email: "Email",
    phone: "Phone",
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img
                  src={profile.avatar_url || "/default-avatar.png"}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-background shadow-lg"
                  alt={`${profile.username}'s avatar`}
                />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {profile.display_name}
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-xl text-muted-foreground mb-6">
              <span>@</span>
              <span>{profile.username}</span>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              {profile.bio}
            </p>

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-4 py-3 bg-background border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200"
                  >
                    <SocialLinkIcon platform={link.platform} />
                    <span className="font-medium text-sm">
                      {link.display_text || PLATFORM_NAMES[link.platform] || link.platform}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      {skills && skills.length > 0 && (
        <section className="py-16 bg-muted/20">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">Skills & Technologies</h2>
                <p className="text-muted-foreground text-lg">Expertise across various domains and tools</p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                  <div key={category} className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-6 pb-3 border-b border-border text-center">
                      {category}
                    </h3>
                    <div className="space-y-4">
                      {categorySkills.map((skill) => (
                        <SkillItem key={skill.id} skill={skill} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Section */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">Latest Writings</h2>
                <p className="text-muted-foreground text-lg">Insights and thoughts from my journey</p>
              </div>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {blogPosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} />
                ))}
              </div>

              {/* View All Blog Posts Link */}
              {blogPosts.length >= 3 && (
                <div className="text-center mt-12">
                  <Link 
                    href={`/${profile.username}/blog`}
                    className="inline-flex items-center gap-3 px-6 py-3 border border-primary text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-200 font-medium"
                  >
                    View all articles
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">
                Featured Projects
                {projects && projects.length > 0 && (
                  <span className="text-muted-foreground font-normal text-lg ml-3">
                    ({sortedProjects.length})
                  </span>
                )}
              </h2>
              <p className="text-muted-foreground text-lg">A collection of my work and experiments</p>
            </div>
            
            {sortedProjects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No projects published yet</p>
              </div>
            ) : (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {sortedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

// Social Link Icon Component
function SocialLinkIcon({ platform }: { platform: string }) {
  const getIconPath = () => {
    const paths: { [key: string]: string } = {
      github: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z",
      twitter: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
      linkedin: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M6 4a2 2 0 11-4 0 2 2 0 014 0z",
      youtube: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z M9.75 15.02V8.98l5.75 3.02-5.75 3.02z",
      instagram: "M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.5-.25a1.25 1.25 0 10-2.5 0 1.25 1.25 0 002.5 0zM12 9a3 3 0 110 6 3 3 0 010-6z",
      facebook: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
      twitch: "M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7",
      discord: "M18.59 5.89c-1.23-.57-2.53-.99-3.88-1.24-.17.3-.36.7-.5 1.02-1.46-.22-2.91-.22-4.35 0-.14-.32-.34-.72-.51-1.02-1.35.25-2.65.67-3.88 1.24C2.5 9.9 1.75 13.8 2.08 17.7c1.5.7 2.96 1.14 4.41 1.42.36-.49.68-1 .96-1.54-.53-.2-1.03-.45-1.5-.75.13-.1.25-.2.37-.3 2.9 1.35 6.04 1.35 8.93 0 .12.1.24.2.37.3-.47.3-.97.55-1.5.75.28.54.6 1.05.96 1.54 1.45-.28 2.91-.72 4.41-1.42.36-4.1-.45-8-2.08-11.81zM9 14.25c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z",
      website: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
      portfolio: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      blog: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
      email: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
      phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    }
    return paths[platform] || "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
  }

  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIconPath()} />
    </svg>
  )
}

// Blog Post Card Component
function BlogPostCard({ post }: { post: any }) {
  const formattedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : ''

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="h-full group hover:shadow-xl transition-all duration-300 cursor-pointer border-border overflow-hidden">
        {/* Cover Image */}
        {post.cover_image && (
          <div className="aspect-[4/3] relative overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}
        
        <CardHeader className="pb-4">
          <CardTitle className="text-xl line-clamp-2 group-hover:text-primary transition-colors duration-200 leading-tight">
            {post.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-base leading-relaxed">
            {post.excerpt}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.reading_time} min read</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 2).map((tag: string, index: number) => (
                <span 
                  key={index} 
                  className="bg-secondary text-secondary-foreground text-xs px-3 py-1.5 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
              {post.tags.length > 2 && (
                <span className="bg-secondary text-secondary-foreground text-xs px-3 py-1.5 rounded-full font-medium">
                  +{post.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

// Skill Item Component
function SkillItem({ skill }: { skill: any }) {
  const renderProficiencyBars = (level: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 w-4 rounded-full ${
              i <= level ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm">{skill.name}</span>
        {skill.is_featured && (
          <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
            Featured
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {renderProficiencyBars(skill.proficiency_level)}
        {skill.years_of_experience && (
          <span className="text-xs text-muted-foreground font-medium min-w-[2rem] text-right">
            {skill.years_of_experience}y
          </span>
        )}
      </div>
    </div>
  )
}

// Project Card Component
function ProjectCard({ project }: { project: any }) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
      {/* Project Image */}
      {project.image_url && (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={project.image_url}
            alt={project.title}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {project.is_featured && (
            <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full font-medium shadow-lg">
              Featured
            </span>
          )}
        </div>
      )}
      
      {/* Project Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-semibold text-xl mb-3 line-clamp-1 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-2 flex-1 leading-relaxed">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.slice(0, 3).map((tag: string, index: number) => (
              <span 
                key={index} 
                className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full font-medium">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Project Links */}
        <div className="flex gap-4 mt-auto pt-4 border-t border-border">
          {project.demo_url && (
            <Link 
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Live Demo</span>
            </Link>
          )}
          {project.github_url && (
            <Link 
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Source</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}