import { Metadata } from "next"
import { NotificationsPage } from "./notifications-client"

// For demo purposes, we'll use a hardcoded user ID
// In production, this would come from the session/auth
const DEMO_USER_ID = "demo-user-123"

export const metadata: Metadata = {
  title: "Notifications — AI3",
  description: "View your airdrop notifications and updates",
}

export default function NotificationsPageRoute() {
  return <NotificationsPage userId={DEMO_USER_ID} />
}