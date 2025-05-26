import { useState, useEffect } from "react";
import { Shield, AlertCircle, Calendar, Clock } from "lucide-react";
import { ProductWarrantyInfo } from "@/types/inventory";

interface WarrantyInfoProps {
  propertyId: number;
}

export default function WarrantyInfoSection({ propertyId }: WarrantyInfoProps) {
  const [warrantyInfo, setWarrantyInfo] = useState<ProductWarrantyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarrantyInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/inventory/warranty?propertyId=${propertyId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch warranty information");
        }

        const data = await response.json();
        setWarrantyInfo(data.warrantyInfo);
      } catch (err) {
        console.error("Error fetching warranty information:", err);
        setError("Could not load warranty information");
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      fetchWarrantyInfo();
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

  if (!warrantyInfo) {
    return (
      <div className="border border-gray-200 rounded-md p-4 my-4 bg-gray-50">
        <div className="flex items-center mb-2">
          <Shield size={16} className="mr-2 text-gray-600" />
          <h3 className="font-medium text-gray-700">Warranty Information</h3>
        </div>
        <p className="text-sm text-gray-500">No warranty information available for this product.</p>
      </div>
    );
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className={`border rounded-md p-4 my-4 ${
        warrantyInfo.warrantyStatus === "active"
          ? "border-green-200 bg-green-50"
          : warrantyInfo.warrantyStatus === "expired"
          ? "border-red-200 bg-red-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center mb-2">
        <Shield
          size={16}
          className={`mr-2 ${
            warrantyInfo.warrantyStatus === "active"
              ? "text-green-600"
              : warrantyInfo.warrantyStatus === "expired"
              ? "text-red-600"
              : "text-gray-600"
          }`}
        />
        <h3
          className={`font-medium ${
            warrantyInfo.warrantyStatus === "active"
              ? "text-green-800"
              : warrantyInfo.warrantyStatus === "expired"
              ? "text-red-800"
              : "text-gray-700"
          }`}
        >
          Warranty Information
        </h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start">
          <Calendar size={14} className="mr-2 mt-0.5 text-gray-500" />
          <div>
            <span className="font-medium">Import Date:</span>
            <span className="ml-1 text-gray-600">{formatDate(warrantyInfo.importDate)}</span>
          </div>
        </div>

        {warrantyInfo.warrantyPeriod && (
          <div className="flex items-start">
            <Clock size={14} className="mr-2 mt-0.5 text-gray-500" />
            <div>
              <span className="font-medium">Warranty Period:</span>
              <span className="ml-1 text-gray-600">{warrantyInfo.warrantyPeriod} days</span>
            </div>
          </div>
        )}

        {warrantyInfo.warrantyExpiry && (
          <div className="flex items-start">
            <Calendar size={14} className="mr-2 mt-0.5 text-gray-500" />
            <div>
              <span className="font-medium">Expires On:</span>
              <span
                className={`ml-1 ${
                  warrantyInfo.warrantyStatus === "active" ? "text-gray-600" : "text-red-600 font-medium"
                }`}
              >
                {formatDate(warrantyInfo.warrantyExpiry)}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-start">
          <Shield
            size={14}
            className={`mr-2 mt-0.5 ${
              warrantyInfo.warrantyStatus === "active"
                ? "text-green-600"
                : warrantyInfo.warrantyStatus === "expired"
                ? "text-red-600"
                : "text-gray-500"
            }`}
          />
          <div>
            <span className="font-medium">Status:</span>
            <span
              className={`ml-1 ${
                warrantyInfo.warrantyStatus === "active"
                  ? "text-green-600 font-medium"
                  : warrantyInfo.warrantyStatus === "expired"
                  ? "text-red-600 font-medium"
                  : "text-gray-600"
              }`}
            >
              {warrantyInfo.warrantyStatus === "active" && `Active (${warrantyInfo.daysRemaining} days remaining)`}
              {warrantyInfo.warrantyStatus === "expired" && "Expired"}
              {warrantyInfo.warrantyStatus === "unknown" && "Unknown"}
            </span>
          </div>
        </div>

        {warrantyInfo.importReference && (
          <div className="flex items-start">
            <div className="mr-2 mt-0.5 w-3.5 h-3.5 flex justify-center items-center">#</div>
            <div>
              <span className="font-medium">Reference:</span>
              <span className="ml-1 text-gray-600">{warrantyInfo.importReference}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
