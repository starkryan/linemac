import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { headers as getHeaders } from "next/headers"
import { query } from "@/lib/db"

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await getHeaders()
  })

  if (!session?.user) {
    redirect('/login')
  }

  // Get the user's role from the database
  const userResult = await query(
    'SELECT role FROM "user" WHERE id = $1',
    [session.user.id]
  )

  if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  )
}