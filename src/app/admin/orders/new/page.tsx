"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import {
    createOrder,
    getProductProperties,
    formatCurrency,
} from "@/actions/order";

const OrderItemSchema = z.object({
    propertyId: z.coerce.number().min(1, "Product variant is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

type OrderFormValues = {
    userId: number | null;
    userEmail: string;
    fullname: string;
    phone: string;
    paymentMethod: string;
    shippingAddress: string;
    notes: string;
    orderItems: {
        propertyId: number;
        quantity: number;
        productTitle: string;
        productId: number;
        propertyName: string;
        price: number;
    }[];
};

interface Product {
    id: number;
    title: string;
    image: string | null;
    price: number;
    properties: {
        id: number;
        name: string;
        price: number;
        inventory: number;
    }[];
}

export default function CreateOrderPage() {
    const router = useRouter();
    const [formValues, setFormValues] = useState<OrderFormValues>({
        userId: null,
        userEmail: "",
        fullname: "",
        phone: "",
        paymentMethod: "CASH",
        shippingAddress: "",
        notes: "",
        orderItems: [],
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
    const [itemQuantity, setItemQuantity] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (searchQuery.trim().length > 2) {
            searchProducts();
        }
    }, [searchQuery]);

    const searchProducts = async () => {
        setIsSearching(true);
        try {
            // This is a mock implementation - in a real app, you would call an API endpoint
            // that searches for products based on the query
            const response = await fetch(`/api/products/search?query=${searchQuery}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.products || []);
            } else {
                console.error("Failed to search products:", await response.text());
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Error searching products:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleProductSelect = async (product: Product) => {
        setSelectedProduct(product);
        setSelectedProperty(null);
        setSearchQuery("");
        setSearchResults([]);

        // If the product has only one property, auto-select it
        if (product.properties.length === 1) {
            setSelectedProperty(product.properties[0].id);
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct || !selectedProperty) {
            setErrors({ ...errors, item: "Please select a product and variant" });
            return;
        }

        if (itemQuantity < 1) {
            setErrors({ ...errors, quantity: "Quantity must be at least 1" });
            return;
        }

        const property = selectedProduct.properties.find(p => p.id === selectedProperty);
        if (!property) {
            setErrors({ ...errors, property: "Selected variant not found" });
            return;
        }

        // Check if we already have this item
        const existingItemIndex = formValues.orderItems.findIndex(
            item => item.propertyId === selectedProperty
        );

        if (existingItemIndex >= 0) {
            // Update quantity of existing item
            const updatedItems = [...formValues.orderItems];
            updatedItems[existingItemIndex].quantity += itemQuantity;

            setFormValues({
                ...formValues,
                orderItems: updatedItems
            });
        } else {
            // Add new item
            setFormValues({
                ...formValues,
                orderItems: [
                    ...formValues.orderItems,
                    {
                        propertyId: property.id,
                        quantity: itemQuantity,
                        productTitle: selectedProduct.title,
                        productId: selectedProduct.id,
                        propertyName: property.name,
                        price: property.price,
                    }
                ]
            });
        }

        // Reset selection
        setSelectedProduct(null);
        setSelectedProperty(null);
        setItemQuantity(1);
        setErrors({ ...errors, item: undefined, quantity: undefined, property: undefined });
    };

    const removeItem = (index: number) => {
        const updatedItems = [...formValues.orderItems];
        updatedItems.splice(index, 1);
        setFormValues({ ...formValues, orderItems: updatedItems });
    };

    const calculateTotal = () => {
        return formValues.orderItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const formErrors: Record<string, string> = {};

        if (formValues.orderItems.length === 0) {
            formErrors.items = "Add at least one item to the order";
        }

        if (!formValues.userEmail && !formValues.fullname) {
            formErrors.customer = "Enter either an email or a name for the customer";
        }

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createOrder({
                userId: formValues.userId,
                userEmail: formValues.userEmail.trim() || undefined,
                fullname: formValues.fullname.trim() || undefined,
                phone: formValues.phone.trim() || undefined,
                status: OrderStatus.PENDING,
                paymentMethod: formValues.paymentMethod,
                shippingAddress: formValues.shippingAddress.trim() || undefined,
                notes: formValues.notes.trim() || undefined,
                items: formValues.orderItems.map(item => ({
                    propertyId: item.propertyId,
                    quantity: item.quantity,
                })),
            });

            if (result.success && result.orderId) {
                router.push(`/admin/orders/${result.orderId}`);
            } else {
                console.error("Error creating order:", result.error);
                setErrors({ submit: result.error || "Failed to create order" });
            }
        } catch (error) {
            console.error("Failed to submit order:", error);
            setErrors({ submit: "An unexpected error occurred" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <button
                    onClick={() => router.push("/admin/orders")}
                    className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Orders
                </button>
                <h1 className="text-3xl font-bold">Create New Order</h1>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer Information */}
                <div className="md:col-span-1">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formValues.userEmail}
                                    onChange={(e) => setFormValues({ ...formValues, userEmail: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="customer@example.com"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formValues.fullname}
                                    onChange={(e) => setFormValues({ ...formValues, fullname: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formValues.phone}
                                    onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="+1 (123) 456-7890"
                                />
                            </div>

                            {errors.customer && (
                                <p className="text-red-500 text-sm mt-2">{errors.customer}</p>
                            )}
                        </div>
                    </div>

                    {/* Order Information */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden mt-6">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Information</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Method
                                </label>
                                <select
                                    value={formValues.paymentMethod}
                                    onChange={(e) => setFormValues({ ...formValues, paymentMethod: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="CREDIT_CARD">Credit Card</option>
                                    <option value="PAYPAL">PayPal</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Shipping Address
                                </label>
                                <textarea
                                    value={formValues.shippingAddress}
                                    onChange={(e) => setFormValues({ ...formValues, shippingAddress: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows={3}
                                    placeholder="Enter shipping address..."
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Order Notes
                                </label>
                                <textarea
                                    value={formValues.notes}
                                    onChange={(e) => setFormValues({ ...formValues, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows={3}
                                    placeholder="Enter any additional notes..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="md:col-span-2">
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Items</h2>

                            {/* Product Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search Products
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Type to search products..."
                                    />
                                    {isSearching && (
                                        <div className="absolute right-3 top-2">
                                            <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
                                        {searchResults.map(product => (
                                            <div
                                                key={product.id}
                                                className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                                                onClick={() => handleProductSelect(product)}
                                            >
                                                <div className="font-medium">{product.title}</div>
                                                <div className="text-sm text-gray-500">
                                                    {product.properties.length} variants available
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Selected Product */}
                            {selectedProduct && (
                                <div className="mb-6 p-4 border border-gray-200 rounded-md">
                                    <h3 className="font-medium">{selectedProduct.title}</h3>

                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Variant
                                            </label>
                                            <select
                                                value={selectedProperty || ""}
                                                onChange={(e) => setSelectedProperty(e.target.value ? parseInt(e.target.value) : null)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            >
                                                <option value="">Select variant</option>
                                                {selectedProduct.properties.map(property => (
                                                    <option key={property.id} value={property.id} disabled={property.inventory < 1}>
                                                        {property.name} - {formatCurrency(property.price)}
                                                        {property.inventory < 1 ? " (Out of stock)" : ` (${property.inventory} available)`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantity
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={itemQuantity}
                                                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleAddItem}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Add to Order
                                        </button>
                                    </div>

                                    {errors.item && <p className="text-red-500 text-sm mt-2">{errors.item}</p>}
                                    {errors.quantity && <p className="text-red-500 text-sm mt-2">{errors.quantity}</p>}
                                    {errors.property && <p className="text-red-500 text-sm mt-2">{errors.property}</p>}
                                </div>
                            )}

                            {/* Order Items List */}
                            <div className="border-t border-gray-200 mt-4 pt-4">
                                <h3 className="font-medium mb-4">Added Items</h3>

                                {formValues.orderItems.length === 0 ? (
                                    <p className="text-gray-500">No items added to this order yet</p>
                                ) : (
                                    <div className="space-y-4">
                                        {formValues.orderItems.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-md">
                                                <div>
                                                    <div className="font-medium">{item.productTitle}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Variant: {item.propertyName}
                                                    </div>
                                                    <div className="text-sm">
                                                        {formatCurrency(item.price)} × {item.quantity} = {formatCurrency(item.price * item.quantity)}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {errors.items && <p className="text-red-500 text-sm mt-2">{errors.items}</p>}

                                <div className="mt-6 border-t border-gray-200 pt-4">
                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total</span>
                                        <span>{formatCurrency(calculateTotal())}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-6 flex justify-end">
                        {errors.submit && <p className="text-red-500 mr-4 self-center">{errors.submit}</p>}

                        <button
                            type="submit"
                            disabled={isSubmitting || formValues.orderItems.length === 0}
                            className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating Order..." : "Create Order"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
