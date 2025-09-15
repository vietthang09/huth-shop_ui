"use client"
import { ArrowRight, Trash } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { fCurrency } from '@/shared/utils/format-number';

export default function CartPage() {
    const cartItems = useCartStore((state) => state.cartItems);

    const selectedItems = cartItems;
    const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmount = subtotal;

    return (
        <div className="mt-40 flex justify-center gap-8">
            {/* Left: Cart Items */}
            <div className="flex-1 max-w-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked readOnly className="w-5 h-5" />
                        <span className="font-medium">{selectedItems.length}/{cartItems.length} sản phẩm</span>
                    </div>
                    <button className="text-sm text-gray-500 hover:underline">Xóa hết</button>
                </div>
                {selectedItems.length === 0 ? (
                    <div className="bg-white p-8 rounded shadow">Giỏ hàng của bạn đang trống.</div>
                ) : (
                    <div className="bg-white rounded shadow p-6 flex items-center gap-4">
                        <input type="checkbox" checked readOnly className="w-5 h-5" />
                        <div className="flex-1">
                            <div className="font-semibold text-lg">{selectedItems[0].name}</div>
                            <div className="flex items-center gap-2 mt-4">
                                <button className="w-8 h-8 rounded bg-gray-100 text-lg">-</button>
                                <span className="font-medium">{selectedItems[0].quantity}</span>
                                <button className="w-8 h-8 rounded bg-gray-100 text-lg">+</button>
                            </div>
                        </div>
                        <button className="text-red-500 text-xl" title="Delete"><Trash /></button>
                        <div className="text-right">
                            <div className="text-xs text-gray-400">SUBTOTAL</div>
                            <div className="font-semibold text-lg">{fCurrency((selectedItems[0].price * selectedItems[0].quantity), { currency: "VND" })}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Coupon & Price Details */}
            <div className="w-96">
                <div className="bg-white rounded shadow p-6">
                    <div className="font-semibold mb-2">Chi tiết</div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>{selectedItems.length} sản phẩm</span>
                        <span>{fCurrency(subtotal, { currency: "VND" })}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold text-lg mb-4">
                        <span>Tổng cộng</span>
                        <span>{fCurrency(totalAmount, { currency: "VND" })}</span>
                    </div>
                    <button className="w-full bg-black text-white py-2 rounded-2xl flex items-center justify-center gap-2 text-base font-medium">
                        Thanh toán <span className="text-xl"><ArrowRight /></span>
                    </button>
                </div>
            </div>
        </div>
    );
}