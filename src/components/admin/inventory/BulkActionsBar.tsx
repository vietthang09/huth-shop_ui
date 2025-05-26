import React, { useState } from "react";
import { Check, X, RefreshCw, AlertCircle } from "lucide-react";
import Button from "@/components/UI/button";
import { bulkProcessImports, bulkUpdatePaymentStatus } from "@/actions/inventory/import";
import { ImportPaymentStatus } from "@/types/inventory";

interface BulkActionsBarProps {
  selectedIds: number[];
  onActionComplete: () => void;
  onClearSelection: () => void;
}

export default function BulkActionsBar({ selectedIds, onActionComplete, onClearSelection }: BulkActionsBarProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (selectedIds.length === 0) return null;

  const handleBulkProcess = async () => {
    try {
      setProcessing(true);
      setError(null);
      setSuccessMessage(null);

      const result = await bulkProcessImports(selectedIds);

      if (result.success) {
        setSuccessMessage(result.message);
        onActionComplete();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while processing imports");
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkUpdatePayment = async (status: ImportPaymentStatus) => {
    try {
      setProcessing(true);
      setError(null);
      setSuccessMessage(null);

      const result = await bulkUpdatePaymentStatus(selectedIds, status);

      if (result.success) {
        setSuccessMessage(result.message);
        onActionComplete();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating payment status");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg z-10 border-t border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedIds.length} {selectedIds.length === 1 ? "import" : "imports"} selected
            </span>

            {successMessage && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check size={16} />
                {successMessage}
              </span>
            )}

            {error && (
              <span className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={16} />
                {error}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onClearSelection}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              disabled={processing}
            >
              <X size={16} className="mr-1" />
              Clear Selection
            </Button>

            <Button
              onClick={handleBulkProcess}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={processing}
            >
              <RefreshCw size={16} className="mr-1" />
              Process Selected
            </Button>

            <div className="relative group">
              <Button className="bg-green-600 hover:bg-green-700 text-white" disabled={processing}>
                <Check size={16} className="mr-1" />
                Mark Payment
              </Button>
              <div className="hidden group-hover:block absolute right-0 bottom-full mb-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-20">
                <button
                  onClick={() => handleBulkUpdatePayment(ImportPaymentStatus.PAID)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Mark as Paid
                </button>
                <button
                  onClick={() => handleBulkUpdatePayment(ImportPaymentStatus.PARTIALLY_PAID)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Mark as Partially Paid
                </button>
                <button
                  onClick={() => handleBulkUpdatePayment(ImportPaymentStatus.PENDING)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Mark as Pending
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
