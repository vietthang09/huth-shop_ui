"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, AlertCircle, Clock, Check, X, CreditCard, Package, FileText } from "lucide-react";
import {
  getImportDetails,
  updateImportStatus,
  updateImportPaymentStatus,
  processInventoryImport,
  cancelImport,
} from "@/actions/inventory/import";
import { ImportDetails, ImportStatus, ImportPaymentStatus } from "@/types/inventory";
import Button from "@/components/UI/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ImportDetailPageProps {
  params: {
    id: string;
  };
}

export default function ImportDetailPage({ params }: ImportDetailPageProps) {
  const importId = parseInt(params.id);
  const router = useRouter();

  const [importData, setImportData] = useState<ImportDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch import details
  useEffect(() => {
    const fetchImportDetails = async () => {
      try {
        setLoading(true);
        const data = await getImportDetails(importId);
        setImportData(data);
      } catch (err) {
        setError("Failed to fetch import details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (importId) {
      fetchImportDetails();
    }
  }, [importId]);

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status: ImportStatus) => {
    switch (status) {
      case "DRAFT":
        return "bg-gray-200 text-gray-800";
      case "PENDING":
        return "bg-blue-200 text-blue-800";
      case "PROCESSING":
        return "bg-yellow-200 text-yellow-800";
      case "COMPLETED":
        return "bg-green-200 text-green-800";
      case "CANCELLED":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  // Get payment status badge color
  const getPaymentColor = (status: ImportPaymentStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PARTIALLY_PAID":
        return "bg-blue-100 text-blue-800";
      case "PAID":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus: ImportStatus) => {
    try {
      setProcessing(true);
      await updateImportStatus({ importId, importStatus: newStatus });

      // Refresh data
      const updatedData = await getImportDetails(importId);
      setImportData(updatedData);

      setSuccessMessage(`Import status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to update import status");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // Handle payment status update
  const handlePaymentUpdate = async (newStatus: ImportPaymentStatus) => {
    try {
      setProcessing(true);
      await updateImportPaymentStatus({ importId, paymentStatus: newStatus });

      // Refresh data
      const updatedData = await getImportDetails(importId);
      setImportData(updatedData);

      setSuccessMessage(`Payment status updated to ${newStatus.replace("_", " ")}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to update payment status");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // Process the import
  const handleProcess = async () => {
    try {
      setProcessing(true);
      await processInventoryImport(importId);

      // Refresh data
      const updatedData = await getImportDetails(importId);
      setImportData(updatedData);

      setSuccessMessage("Import processed successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to process import");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  // Cancel the import
  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this import? This action cannot be undone.")) {
      try {
        setProcessing(true);
        await cancelImport(importId);

        // Refresh data
        const updatedData = await getImportDetails(importId);
        setImportData(updatedData);

        setSuccessMessage("Import cancelled successfully");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError("Failed to cancel import");
        console.error(err);
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/inventory/imports" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={16} className="mr-1" /> Back to Imports
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <Check size={20} className="mr-2" />
          {successMessage}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mb-2"></div>
          <p>Loading import details...</p>
        </div>
      ) : importData ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Import header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {importData.reference || `Import #${importData.id}`}
                </h1>
                <p className="text-gray-500 mt-1">Created on {formatDate(importData.createdAt)}</p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(importData.importStatus)}`}
                >
                  {importData.importStatus}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentColor(importData.paymentStatus)}`}
                >
                  {importData.paymentStatus.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>

          {/* Import details */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Supplier and creator info */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Supplier</h2>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="font-medium">{importData.supplier.name}</p>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Created By</h2>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="font-medium">{importData.user.fullname || importData.user.email}</p>
                  <p className="text-sm text-gray-500">{importData.user.email}</p>
                </div>
              </div>

              {/* Description */}
              {importData.description && (
                <div className="md:col-span-2">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Description</h2>
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <p>{importData.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-2">
              {/* Status actions based on current status */}
              {importData.importStatus === "DRAFT" && (
                <Button
                  onClick={() => handleStatusUpdate("PENDING" as ImportStatus)}
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                >
                  <Clock size={16} />
                  Set as Pending
                </Button>
              )}

              {importData.importStatus === "PENDING" && (
                <Button
                  onClick={handleProcess}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                >
                  <Package size={16} />
                  Process Import
                </Button>
              )}

              {["DRAFT", "PENDING"].includes(importData.importStatus) && (
                <Button
                  onClick={handleCancel}
                  disabled={processing}
                  className="bg-red-600 hover:bg-red-700 flex items-center gap-1"
                >
                  <X size={16} />
                  Cancel Import
                </Button>
              )}

              {/* Payment status actions */}
              {importData.paymentStatus === "PENDING" && (
                <>
                  <Button
                    onClick={() => handlePaymentUpdate("PARTIALLY_PAID" as ImportPaymentStatus)}
                    disabled={processing}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                  >
                    <CreditCard size={16} />
                    Mark as Partially Paid
                  </Button>
                  <Button
                    onClick={() => handlePaymentUpdate("PAID" as ImportPaymentStatus)}
                    disabled={processing}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                  >
                    <Check size={16} />
                    Mark as Paid
                  </Button>
                </>
              )}

              {importData.paymentStatus === "PARTIALLY_PAID" && (
                <Button
                  onClick={() => handlePaymentUpdate("PAID" as ImportPaymentStatus)}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                >
                  <Check size={16} />
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>

          {/* Item list */}
          <div className="px-6 py-4 border-t border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Items ({importData.importItems.length})</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attributes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Warranty
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importData.importItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.property.product.title}</div>
                        <div className="text-xs text-gray-500">SKU: {item.property.product.sku}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {item.property.attributeSet.name}: {item.property.attributeSet.value}
                          {item.property.attributeSet.unit && ` ${item.property.attributeSet.unit}`}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(Number(item.netPrice))}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(Number(item.netPrice) * item.quantity)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {item.warrantyPeriod
                          ? `${item.warrantyPeriod} days`
                          : item.warrantyExpiry
                          ? `Until ${formatDate(item.warrantyExpiry)}`
                          : "No warranty"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right font-medium">
                      Total Amount:
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">
                      {formatCurrency(Number(importData.totalAmount))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Import not found</h3>
          <p className="text-gray-500 mb-4">
            The import you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push("/admin/inventory/imports")} className="bg-blue-600 hover:bg-blue-700">
            Back to Imports
          </Button>
        </div>
      )}
    </div>
  );
}
