import { LayoutTemplate, Database, Code } from "lucide-react";

export const RECOMMENDED_TEMPLATES = [
  {
    id: "frontend",
    jobTitle: "Senior Frontend Engineer",
    techStack: "React, TypeScript, Next.js",
    experienceLevel: "Senior",
    duration: 5,
    icon: <LayoutTemplate className="h-6 w-6 text-pink-400" />
  },
  {
    id: "backend",
    jobTitle: "Backend Developer",
    techStack: "Node.js, Express, PostgreSQL",
    experienceLevel: "Junior",
    duration: 5,
    icon: <Database className="h-6 w-6 text-indigo-400" />
  },
  {
    id: "fullstack",
    jobTitle: "Fullstack Engineer",
    techStack: "React, Node.js, MongoDB",
    experienceLevel: "Senior",
    duration: 10,
    icon: <Code className="h-6 w-6 text-purple-400" />
  }
];
