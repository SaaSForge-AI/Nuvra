import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const cert = await prisma.certificate.findUnique({ where: { code: params.id } });
  if (!cert) return notFound();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-[700px] overflow-hidden">
        <div className="h-2 bg-accent" />
        <CardContent className="p-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accentMuted px-3 py-1 text-xs text-accent mb-6">Certificate of Completion</div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Certificate</h1>
          <p className="text-muted mb-8">This certifies that</p>
          <p className="text-2xl font-semibold mb-2">{cert.studentName}</p>
          <p className="text-muted mb-8">has successfully completed</p>
          <p className="text-xl font-medium mb-2">{cert.courseTitle}</p>
          <p className="text-sm text-muted mb-8">Issued by {cert.creatorName} on {new Date(cert.issuedAt).toLocaleDateString()}</p>
          <div className="p-4 rounded-xl bg-surface2 border border-border text-xs"><p>Verification Code: {cert.code}</p><p className="text-muted mt-1">Verify at /certificate/{cert.code}</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
