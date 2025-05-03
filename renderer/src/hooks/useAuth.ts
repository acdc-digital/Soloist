import { useConvexAuth } from "convex/react"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"

// Define the user type
export type User = {
  id: string
  name: string | null
  email: string | null
  imageUrl: string | null
}

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  
  // Get the current user from your Convex database
  // Replace with your actual user query if different
  const user = useQuery(api.users.getMe)
  
  return {
    isAuthenticated,
    isLoading,
    user: user as User | null,
  }
}