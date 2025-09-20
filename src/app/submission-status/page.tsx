import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/app/components/Header";
import { auth } from "@/lib/auth-server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic'; // Ensure this page is dynamic

interface CorrectionRequest {
  id: string;
  aadhaar_number: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  created_at: Date;
  updated_at: Date;
}

export default async function SubmissionStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string }>;
}) {
  const params = await searchParams;
  const session = await auth.handler(new Request('http://localhost'));
  if (!session.ok) {
    return <div>Please login to view submission status</div>;
  }
  const { user } = await session.json();

  let request: CorrectionRequest | null = null;

  try {
    if (params.requestId) {
      // Fetch specific request by ID
      const result = await query(
        'SELECT * FROM correction_requests WHERE id = $1',
        [params.requestId]
      );
      if (result.rows.length > 0) {
        request = {
          ...result.rows[0],
          created_at: new Date(result.rows[0].created_at),
          updated_at: new Date(result.rows[0].updated_at),
        };
      }
    } else {
      // Fetch latest request for this user
      const result = await query(
        'SELECT * FROM correction_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [user.id]
      );
      if (result.rows.length > 0) {
        request = {
          ...result.rows[0],
          created_at: new Date(result.rows[0].created_at),
          updated_at: new Date(result.rows[0].updated_at),
        };
      }
    }
  } catch (error) {
    console.error('Database error:', error);
    return <div>Error fetching request data</div>;
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto p-6">
          <Card className="max-w-4xl mx-auto shadow-lg border-2 border-black">
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold mb-4">No Application Found</h2>
              <p className="text-gray-600 mb-4">
                You haven't submitted any Aadhaar correction applications yet.
              </p>
              <Button asChild>
                <a href="/aadhaar-correction">Submit New Application</a>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const statusColors: Record<CorrectionRequest["status"], string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto p-6">
        <Card className="max-w-4xl mx-auto shadow-lg border-2 border-black">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6">Aadhaar Correction Status</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Request ID</p>
                  <p className="font-medium">{request.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[request.status]}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Aadhaar Number</p>
                  <p className="font-medium">{request.aadhaar_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{request.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Submitted On</p>
                  <p className="font-medium">
                    {request.created_at.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {request.updated_at.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Admin controls - only show for admin users */}
              {user.role === 'admin' && (
                <div className="border-t pt-4 space-x-4">
                  <form action={async () => {
                    'use server';
                    await query(
                      'UPDATE correction_requests SET status = $1, updated_at = $2 WHERE id = $3',
                      ['rejected', new Date().toISOString(), request.id]
                    );
                  }}>
                    <Button variant="outline" type="submit">Reject</Button>
                  </form>
                  <form action={async () => {
                    'use server';
                    await query(
                      'UPDATE correction_requests SET status = $1, updated_at = $2 WHERE id = $3',
                      ['approved', new Date().toISOString(), request.id]
                    );
                  }}>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" type="submit">
                      Approve
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
