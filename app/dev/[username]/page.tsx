import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function PublicProfile({ params }: { params: Promise<{ username: string }> }) {
  // Await the params object
  const { username } = await params
  const supabase = await createClient()

  console.log("Looking for username:", username)

  // First, get the profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url")
    .eq("username", username) // Use the awaited username
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

  // Sort projects by featured status and display order
  const sortedProjects = (projects || [])
    .sort((a, b) => {
      // First by featured status
      if (a.is_featured && !b.is_featured) return -1
      if (!a.is_featured && b.is_featured) return 1
      // Then by display_order
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

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Header */}
      <div className="container mx-auto px-6 py-12 flex flex-col items-center text-center">
        <img
          src={profile.avatar_url || "/default-avatar.png"}
          className="w-24 h-24 rounded-full mb-6 border-4 border-border"
          alt={`${profile.username}'s avatar`}
        />
        <h1 className="text-4xl font-bold">@{profile.username}</h1>
        <p className="text-xl text-muted-foreground mt-2">{profile.display_name}</p>
        <p className="mt-6 text-base text-center max-w-2xl text-muted-foreground leading-relaxed">
          {profile.bio}
        </p>
      </div>

      {/* Skills Section */}
      {skills && skills.length > 0 && (
        <div className="container mx-auto px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Skills & Technologies</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <div key={category} className="bg-card rounded-lg border border-border p-6">
                  <h3 className="font-semibold text-lg mb-4 text-center">{category}</h3>
                  <div className="space-y-3">
                    {categorySkills.map((skill) => (
                      <SkillItem key={skill.id} skill={skill} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Projects Section */}
      <div className="container mx-auto px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Projects {projects && projects.length > 0 && `(${sortedProjects.length})`}
          </h2>
          
          {sortedProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects yet</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Skill Item Component
function SkillItem({ skill }: { skill: any }) {
  const renderProficiencyStars = (level: number) => {
    const stars = []
    
    // level is between 1-5
    for (let i = 1; i <= 5; i++) {
      if (i <= level) {
        // Full star
        stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)
      } else {
        // Empty star
        stars.push(<Star key={i} className="h-3 w-3 text-muted-foreground" />)
      }
    }
    
    return stars
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span className="font-medium text-sm">{skill.name}</span>
        {skill.is_featured && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            Featured
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {renderProficiencyStars(skill.proficiency_level)}
        </div>
        {skill.years_of_experience && (
          <span className="text-xs text-muted-foreground">
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
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {/* Project Image */}
      {project.image_url && (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={project.image_url}
            alt={project.title}
            className="object-cover w-full h-full"
          />
          {project.is_featured && (
            <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
              Featured
            </span>
          )}
        </div>
      )}
      
      {/* Project Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.tags.slice(0, 3).map((tag: string, index: number) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Project Links */}
        <div className="flex gap-3 mt-auto">
          {project.demo_url && (
            <Link 
              href={project.demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Live Demo</span>
              <ExternalLinkIcon className="w-3 h-3" />
            </Link>
          )}
          {project.github_url && (
            <Link 
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-600 hover:underline flex items-center gap-1"
            >
              <span>Code</span>
              <GithubIcon className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// Star Icon Component
function Star({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
}

// Simple Icons
function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}