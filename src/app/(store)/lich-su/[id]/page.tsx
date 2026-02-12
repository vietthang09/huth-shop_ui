"use client";

import { findOne, getMyOrders } from "@/services/order";
import { Order } from "@/types/order";
import { LoaderCircle, Search } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order>();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!id) return;
        const order = await findOne(+id);
        setOrder(order.data);
      } catch (error) {
        toast.error("Failed to fetch order details.");
      }
    };
    fetchOrder();
  }, [id]);
  return (
    <div>
      aaaa
      {/* <div className="container mx-auto">{JSON.stringify(order)}</div> */}
    </div>
  );
}
