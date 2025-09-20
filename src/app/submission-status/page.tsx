import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/app/components/Header";
import { auth } from "@/lib/auth-server";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic'; // Ensure this page is dynamic

interface Submission {
  aadhaarNumber: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  pdfUrl?: string;
}

export default async function SubmissionStatusPage() {
  const session = await auth.handler(new Request('http://localhost'));
  if (!session.ok) {
    return <div>Please login to view submission status</div>;
  }
  const { user } = await session.json();

  // Fetch submission data from database
  let submissions;
  try {
    const result = await query(
      'SELECT * FROM submissions WHERE aadhaarNumber = $1 ORDER BY submittedAt DESC LIMIT 1',
      [user.aadhaarNumber]
    );
    submissions = result.rows;
  } catch (error) {
    console.error('Database error:', error);
    return <div>Error fetching submission data</div>;
  }

  if (!submissions || submissions.length === 0) {
    return <div>No submission found for your Aadhaar number</div>;
  }

  const submission: Submission = {
    aadhaarNumber: submissions[0].aadhaarNumber,
    status: submissions[0].status,
    submittedAt: new Date(submissions[0].submittedAt),
    reviewedAt: submissions[0].reviewedAt ? new Date(submissions[0].reviewedAt) : undefined,
    pdfUrl: submissions[0].pdfUrl
  };

  const statusColors: Record<Submission["status"], string> = {
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
                  <p className="text-sm text-gray-600">Aadhaar Number</p>
                  <p className="font-medium">{submission.aadhaarNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[submission.status]}`}>
                    {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Submitted On</p>
                  <p className="font-medium">
                    {submission.submittedAt.toLocaleDateString()}
                  </p>
                </div>
                {submission.reviewedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Reviewed On</p>
                    <p className="font-medium">
                      {submission.reviewedAt.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {submission.pdfUrl && (
                <div className="border-t pt-4">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    asChild
                  >
                    <a href={submission.pdfUrl} download="AadhaarCorrection.pdf">
                      Download PDF Receipt
                    </a>
                  </Button>
                </div>
              )}

              {/* Admin controls - only show for admin users */}
              {user.role === 'admin' && (
                <div className="border-t pt-4 space-x-4">
                  <form action={async () => {
                    'use server';
                    await query(
                      'UPDATE submissions SET status = $1, reviewedAt = $2 WHERE aadhaarNumber = $3',
                      ['rejected', new Date().toISOString(), submission.aadhaarNumber]
                    );
                  }}>
                    <Button variant="outline" type="submit">Reject</Button>
                  </form>
                  <form action={async () => {
                    'use server';
                    // Generate a unique filename for the PDF
                    const pdfFilename = `receipt_${submission.aadhaarNumber}_${Date.now()}.pdf`;
                    const pdfUrl = `/receipts/${pdfFilename}`;
                    
                    // Update submission with approved status and PDF URL
                    await query(
                      'UPDATE submissions SET status = $1, reviewedAt = $2, pdfUrl = $3 WHERE aadhaarNumber = $4',
                      ['approved', new Date().toISOString(), pdfUrl, submission.aadhaarNumber]
                    );

                    // Generate PDF receipt
                    const { PDFDocument, rgb } = await import('pdf-lib');
                    
                    const pdfDoc = await PDFDocument.create();
                    const page = pdfDoc.addPage([600, 400]);
                    
                    // Add content to PDF
                    const { height } = page.getSize();
                    const fontSize = 24;
                    
                    page.drawText('Aadhaar Correction Receipt', {
                        x: 50,
                        y: height - 50,
                        size: fontSize,
                        color: rgb(0, 0, 0),
                    });
                    
                    page.drawText(`Aadhaar Number: ${submission.aadhaarNumber}`, {
                        x: 50,
                        y: height - 100,
                        size: 16,
                        color: rgb(0, 0, 0),
                    });
                    
                    page.drawText(`Status: Approved`, {
                        x: 50,
                        y: height - 130,
                        size: 16,
                        color: rgb(0, 0, 0),
                    });
                    
                    page.drawText(`Approved On: ${new Date().toLocaleDateString()}`, {
                        x: 50,
                        y: height - 160,
                        size: 16,
                        color: rgb(0, 0, 0),
                    });
                    
                    // Save PDF to local file system (placeholder - needs actual file storage implementation)
                    const pdfBytes = await pdfDoc.save();
                    // For now, we'll just log the bytes. In a real app, you'd save this to a file system or cloud storage.
                    console.log('PDF generated:', pdfBytes);
                    // TODO: Implement file storage for the generated PDF.
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
