// components/skills-manager.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Star, StarHalf } from "lucide-react"
import { SkillForm } from "./skill-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Skill {
  id?: string
  name: string
  category: string
  proficiency_level: number
  years_of_experience?: number
  is_featured: boolean
}

interface SkillsManagerProps {
  initialSkills: Skill[]
}

export function SkillsManager({ initialSkills }: SkillsManagerProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [showForm, setShowForm] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSaveSkill = async (skillData: Omit<Skill, "id">) => {
    setLoading(true)
    try {
      const url = editingSkill ? `/api/skills/${editingSkill.id}` : "/api/skills"
      const method = editingSkill ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(skillData),
      })

      if (response.ok) {
        const savedSkill = await response.json()
        
        if (editingSkill) {
          setSkills(skills.map(skill => 
            skill.id === editingSkill.id ? savedSkill : skill
          ))
        } else {
          setSkills([...skills, savedSkill])
        }
        
        setShowForm(false)
        setEditingSkill(null)
      } else {
        console.error("Failed to save skill")
      }
    } catch (error) {
      console.error("Error saving skill:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSkill = async () => {
    if (!skillToDelete?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/skills/${skillToDelete.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSkills(skills.filter(skill => skill.id !== skillToDelete.id))
        setSkillToDelete(null)
      } else {
        console.error("Failed to delete skill")
      }
    } catch (error) {
      console.error("Error deleting skill:", error)
    } finally {
      setLoading(false)
    }
  }

const renderProficiencyStars = (level: number) => {
  const stars = []
  
  // level is between 1-5
  for (let i = 1; i <= 5; i++) {
    if (i <= level) {
      // Full star
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    } else {
      // Empty star
      stars.push(<Star key={i} className="h-4 w-4 text-muted-foreground" />)
    }
  }
  
  return stars
}

  const categories = Array.from(new Set(skills.map(skill => skill.category)))

  return (
    <div className="space-y-6">
      {/* Add Skill Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Your Skills</h2>
          <p className="text-muted-foreground">Add and manage your technical skills</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Skills by Category */}
      {categories.length > 0 ? (
        categories.map(category => {
          const categorySkills = skills.filter(skill => skill.category === category)
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {categorySkills.map(skill => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{skill.name}</span>
                            {skill.is_featured && (
                              <Badge variant="secondary" className="text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {renderProficiencyStars(skill.proficiency_level)}
                            <span className="text-xs text-muted-foreground ml-2">
                              {skill.years_of_experience && 
                                `${skill.years_of_experience} year${skill.years_of_experience > 1 ? 's' : ''}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSkill(skill)
                            setShowForm(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSkillToDelete(skill)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No skills added yet</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Skill Form Dialog */}
      {showForm && (
        <SkillForm
          skill={editingSkill}
          onSave={handleSaveSkill}
          onCancel={() => {
            setShowForm(false)
            setEditingSkill(null)
          }}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!skillToDelete} onOpenChange={() => setSkillToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the skill "{skillToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSkill}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}