import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  DatePicker,
  Chip,
  Divider,
} from "@heroui/react";
import { useOrderDialog } from "./OrderDialogContext";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { toast } from "sonner";
import { Trash2, User, Mail, ShoppingBag, PackageCheck, MessageSquare } from "lucide-react";
import { z } from "zod";
import { OrderStatus } from "@/common/contants";
import { sendConfirmationEmail, updateOrder } from "@/services/order";
import { OrderItem } from "@/services/type";
import { parseDate } from "@internationalized/date";
import { fCurrency } from "@/shared/utils/format-number";

const orderSchema = z.object({});
type OrderFormData = z.infer<typeof orderSchema>;

const STATUS_COLOR_MAP: Record<OrderStatus, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  [OrderStatus.PENDING]: "warning",
  [OrderStatus.CONFIRMED]: "primary",
  [OrderStatus.PROCESSING]: "secondary",
  [OrderStatus.DELIVERED]: "success",
  [OrderStatus.CANCELLED]: "danger",
  [OrderStatus.REFUNDED]: "default",
};

const STATUS_LABEL_MAP: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Chờ xác nhận",
  [OrderStatus.CONFIRMED]: "Đã xác nhận",
  [OrderStatus.PROCESSING]: "Đang xử lý",
  [OrderStatus.DELIVERED]: "Đã giao hàng",
  [OrderStatus.CANCELLED]: "Đã hủy",
  [OrderStatus.REFUNDED]: "Đã hoàn tiền",
};

export const OrderDialog: React.FC = () => {
  const { isOpen, mode, selectedOrder, closeDialog, isSubmitting, setIsSubmitting } = useOrderDialog();

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [replyContent, setReplyContent] = React.useState("");
  const [expiredByOrderItemId, setExpiredByOrderItemId] = React.useState<Record<number, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      if ((mode === "edit" || mode === "view") && selectedOrder) {
        // nothing extra needed
      } else if (mode === "process" && selectedOrder) {
        const initialExpiredValues: Record<number, string> = {};
        selectedOrder.orderItems.forEach((item: OrderItem) => {
          if (item.expireAt) {
            const date = new Date(item.expireAt);
            if (!Number.isNaN(date.getTime())) {
              initialExpiredValues[item.id] = date.toISOString().slice(0, 10);
            }
          }
        });
        setExpiredByOrderItemId(initialExpiredValues);
      }
    } else {
      setExpiredByOrderItemId({});
      setReplyContent("");
    }
  }, [isOpen, mode, selectedOrder]);

  const onSubmit = async () => {
    if (mode === "view") return;
    setIsSubmitting(true);
    try {
      if (mode === "process" && selectedOrder) {
        const orderItems = selectedOrder.orderItems.map((item: OrderItem) => ({
          orderItemId: item.id,
          expireAt: expiredByOrderItemId[item.id] || undefined,
        }));
        await updateOrder(selectedOrder.id, { orderItems });
        await sendConfirmationEmail(selectedOrder.id, replyContent);
        toast.success(`Đơn hàng #${selectedOrder.id} đã được xử lý thành công`);
        closeDialog();
      }
    } catch (error: any) {
      const msg = error.response?.data?.message;
      toast.error(msg || "Có lỗi xảy ra khi cập nhật đơn hàng");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDialogTitle = () => {
    switch (mode) {
      case "view":
        return "Chi tiết đơn hàng";
      case "process":
        return "Xử lý đơn hàng";
      default:
        return "Đơn hàng";
    }
  };

  const user = selectedOrder?.user;
  const status = selectedOrder?.status as OrderStatus | undefined;

  return (
    <Modal isOpen={isOpen} onClose={closeDialog} size="2xl" scrollBehavior="inside">
      <ModalContent>
        {() => (
          <>
            {/* ── Header ── */}
            <ModalHeader className="flex items-start justify-between gap-3 pb-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-lg font-semibold">{getDialogTitle()}</span>
                {selectedOrder && (
                  <span className="text-sm font-normal text-default-400">
                    Mã đơn hàng: <span className="font-medium text-default-600">#{selectedOrder.id}</span>
                  </span>
                )}
              </div>
              {status && (
                <Chip color={STATUS_COLOR_MAP[status]} variant="flat" size="sm" className="mt-1 shrink-0">
                  {STATUS_LABEL_MAP[status]}
                </Chip>
              )}
            </ModalHeader>

            <Divider />

            {/* ── Body ── */}
            <ModalBody className="py-5 space-y-6">
              {/* Customer info */}
              {user && (
                <section className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-default-700">
                    <User className="h-4 w-4" />
                    Thông tin khách hàng
                  </h4>
                  <div className="rounded-xl border border-default-200 bg-default-50 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-default-600">
                      <User className="h-3.5 w-3.5 shrink-0 text-default-400" />
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-default-600">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-default-400" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </section>
              )}

              {/* Order summary */}
              {selectedOrder && (
                <section className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-default-700">
                    <ShoppingBag className="h-4 w-4" />
                    Sản phẩm trong đơn
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.orderItems.map((item: OrderItem) => (
                      <div key={item.id} className="rounded-xl border border-default-200 bg-default-50 p-4 space-y-3">
                        {/* Product header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm text-default-800">{item.product.title}</p>
                            <p className="text-xs text-default-500 mt-0.5">Phân loại: {item.variant.title}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-default-400">Số lượng: {item.quantity}</p>
                            <p className="text-sm font-semibold text-primary">{fCurrency(item.total)}</p>
                          </div>
                        </div>

                        {/* Account fields */}
                        {item.fields && Object.keys(item.fields).length > 0 && (
                          <>
                            <Divider className="my-1" />
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-default-500 uppercase tracking-wide">
                                Thông tin tài khoản
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {Object.entries(item.fields).map(([key, value]) => (
                                  <div key={key} className="flex gap-1 text-xs text-default-600">
                                    <span className="font-medium text-default-500 shrink-0">{key}:</span>
                                    <span className="break-all">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {/* Expire date picker (process mode only) */}
                        {mode === "process" && (
                          <>
                            <Divider className="my-1" />
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-default-600 flex items-center gap-1">
                                <PackageCheck className="h-3.5 w-3.5" />
                                Ngày hết hạn
                                <span className="text-default-400 font-normal">(không bắt buộc)</span>
                              </label>
                              <DatePicker
                                size="sm"
                                value={
                                  expiredByOrderItemId[item.id]
                                    ? (parseDate(expiredByOrderItemId[item.id]) as unknown as any)
                                    : undefined
                                }
                                onChange={(date: any) =>
                                  setExpiredByOrderItemId((prev) => ({
                                    ...prev,
                                    [item.id]: date ? date.toString() : "",
                                  }))
                                }
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order total */}
                  <div className="flex justify-end pt-1">
                    <span className="text-sm text-default-500 mr-2">Tổng cộng:</span>
                    <span className="text-base font-bold text-primary">{fCurrency(selectedOrder.total as number)}</span>
                  </div>
                </section>
              )}

              {/* Reply email (process mode only) */}
              {mode === "process" && (
                <section className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-default-700">
                    <MessageSquare className="h-4 w-4" />
                    Nội dung email xác nhận
                    <span className="text-default-400 font-normal text-xs">(không bắt buộc)</span>
                  </h4>
                  <textarea
                    className="w-full rounded-xl border border-default-200 bg-default-50 px-3 py-2.5 text-sm text-default-700 placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition"
                    rows={4}
                    placeholder="Nhập nội dung email gửi cho khách hàng..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                </section>
              )}
            </ModalBody>

            <Divider />

            {/* ── Footer ── */}
            <ModalFooter className="flex items-center justify-between gap-3 pt-3">
              {mode === "view" && selectedOrder && (
                <Button
                  type="button"
                  variant="light"
                  color="danger"
                  onPress={() => setDeleteDialogOpen(true)}
                  isDisabled={isSubmitting}
                  startContent={<Trash2 className="h-4 w-4" />}
                >
                  Xóa đơn hàng
                </Button>
              )}

              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="bordered" onPress={closeDialog} isDisabled={isSubmitting}>
                  {mode === "view" ? "Đóng" : "Hủy"}
                </Button>
                {mode === "process" && (
                  <Button color="primary" isDisabled={isSubmitting} isLoading={isSubmitting} onPress={onSubmit}>
                    Gửi hàng
                  </Button>
                )}
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={async () => {
          setDeleteDialogOpen(false);
          closeDialog();
        }}
        title="Xóa đơn hàng"
        description={`Bạn có chắc chắn muốn xóa đơn hàng #${selectedOrder?.id}? Hành động này không thể hoàn tác.`}
        confirmText="Xóa đơn hàng"
        isLoading={isDeleting}
      />
    </Modal>
  );
};
