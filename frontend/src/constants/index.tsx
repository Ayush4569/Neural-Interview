import { Template } from "@/types";
import { LayoutTemplate, Database, Code, LineChart, Users, Server, Smartphone, PenTool, Terminal } from "lucide-react";

export const RECOMMENDED_TEMPLATES:Template[] = [
  {
    id: "frontend",
    jobTitle: "Senior Frontend Engineer",
    techStack: "React, TypeScript, Next.js",
    experienceLevel: "5+",
    duration: 5,
    icon: <LayoutTemplate className="h-6 w-6 text-pink-400" />
  },
  {
    id: "backend",
    jobTitle: "Backend Developer",
    techStack: "Node.js, Express, PostgreSQL",
    experienceLevel: "1-3",
    duration: 3,
    icon: <Database className="h-6 w-6 text-indigo-400" />
  },
  {
    id: "fullstack",
    jobTitle: "Fullstack Engineer",
    techStack: "React, Node.js, MongoDB",
    experienceLevel: "5+",
    duration: 10,
    icon: <Code className="h-6 w-6 text-purple-400" />
  },
  {
    id: "data_science",
    jobTitle: "Data Scientist",
    techStack: "Python, Pandas, Scikit-Learn",
    experienceLevel: "3-5",
    duration: 5,
    icon: <LineChart className="h-6 w-6 text-blue-400" />
  },
  {
    id: "product_manager",
    jobTitle: "Product Manager",
    techStack: "Agile, Jira, Product Strategy",
    experienceLevel: "5+",
    duration: 10,
    icon: <Users className="h-6 w-6 text-orange-400" />
  },
  {
    id: "devops",
    jobTitle: "DevOps Engineer",
    techStack: "AWS, Docker, Kubernetes",
    experienceLevel: "5+",
    duration: 10,
    icon: <Server className="h-6 w-6 text-teal-400" />
  },
  {
    id: "mobile",
    jobTitle: "Mobile Developer",
    techStack: "React Native, Swift, Kotlin",
    experienceLevel: "3-5",
    duration: 5,
    icon: <Smartphone className="h-6 w-6 text-yellow-400" />
  },
  {
    id: "ui_ux",
    jobTitle: "UI/UX Designer",
    techStack: "Figma, User Research, Prototyping",
    experienceLevel: "3-5",
    duration: 5,
    icon: <PenTool className="h-6 w-6 text-rose-400" />
  },
  {
    id: "python_backend",
    jobTitle: "Python Backend Engineer",
    techStack: "Python, Django, Redis",
    experienceLevel: "3-5",
    duration: 10,
    icon: <Terminal className="h-6 w-6 text-green-400" />
  }
];
