import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, AlertCircle, ExternalLink } from "lucide-react";
import { PendingImportInfo, ImportStatus } from "@/types/inventory";

interface PendingImportsProps {
  propertyId: number;
}

export default function PendingImportsSection({ propertyId }: PendingImportsProps) {
  const [pendingImports, setPendingImports] = useState<PendingImportInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingImports = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/inventory/pending-imports?propertyId=${propertyId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch pending imports");
        }

        const data = await response.json();
        setPendingImports(data);
      } catch (err) {
        console.error("Error fetching pending imports:", err);
        setError("Could not load pending imports");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchPendingImports();
    }
  }, [propertyId]);

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-md p-4 my-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-200 rounded-md p-4 my-4 bg-red-50 text-red-800">
        <div className="flex items-center mb-2">
          <AlertCircle size={16} className="mr-2" />
          <h3 className="font-medium">Error</h3>
        </div>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!pendingImports || !pendingImports.hasPending) {
    return null;
  }

  return (
    <div className="border border-blue-200 rounded-md p-4 my-4 bg-blue-50">
      <div className="flex items-center mb-2">
        <Clock size={16} className="mr-2 text-blue-600" />
        <h3 className="font-medium text-blue-800">Pending Inventory Updates</h3>
      </div>
      <p className="text-sm text-blue-700 mb-3">
        There {pendingImports.pendingImports.length === 1 ? "is" : "are"} {pendingImports.pendingImports.length} pending
        import{pendingImports.pendingImports.length !== 1 ? "s" : ""} for this product variant.
      </p>
      <div className="space-y-2">
        {pendingImports.pendingImports.map((imp) => (
          <div
            key={imp.importId}
            className="text-sm bg-white p-2 rounded border border-blue-200 flex justify-between items-center"
          >
            <div>
              <span className="font-medium">{imp.reference || `Import #${imp.importId}`}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-600">
                {imp.quantity} {imp.quantity === 1 ? "unit" : "units"}
              </span>
              <span className="mx-2">•</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  imp.importStatus === ImportStatus.PENDING
                    ? "bg-blue-100 text-blue-800"
                    : imp.importStatus === ImportStatus.PROCESSING
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {imp.importStatus}
              </span>
            </div>
            <Link
              href={`/admin/inventory/imports/${imp.importId}`}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <ExternalLink size={14} className="mr-1" />
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
