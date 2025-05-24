"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import { DeleteIcon } from "@/components/icons/svgIcons";
import { modifyQuantity, remove } from "@/store/shoppingCart";
import { TCartItemData } from "@/types/shoppingCart.d";

import Quantity from "../../../quantity";

type TProps = {
  data: TCartItemData;
  onLinkClicked: () => void;
};

const CartItem = ({ data, onLinkClicked }: TProps) => {
  const { productName, productId, imgUrl, price, dealPrice = 0, quantity, variantId, variantAttributes } = data;

  const dispatch = useDispatch();
  const router = useRouter();
  const handleQuantityChange = (isReduced: boolean) => {
    dispatch(
      modifyQuantity({
        amount: isReduced ? -1 : 1,
        productId,
        variantId,
      })
    );
  };
  const currentPrice = dealPrice === 0 ? price : dealPrice;

  const handleGoToPage = () => {
    router.push("/product/" + productId);
    onLinkClicked();
  };
  return (
    <div className="flex md:flex-row flex-col mt-5 mx-7 pb-5 justify-between gap-4 border-b border-gray-200">
      <div className={"w-[120px] h-[110px] relative cursor-pointer"} onClick={handleGoToPage}>
        <Image
          src={imgUrl}
          fill
          alt={productName}
          className="rounded-lg overflow-hidden border border-gray-200 object-contain"
        />
        {dealPrice > 0 && price > dealPrice && (
          <div className="absolute top-0 right-0 bg-bitex-red-500 text-white text-xs px-1.5 py-0.5 rounded-bl-md rounded-tr-md">
            -{Math.round(((price - dealPrice) / price) * 100)}%
          </div>
        )}
      </div>
      <div className={"flex flex-grow flex-col"}>
        <h2
          className={
            "mb-2 text-sm text-gray-600 font-medium hover:text-bitex-blue-500 transition-colors cursor-pointer"
          }
          onClick={handleGoToPage}
        >
          {productName}
        </h2>

        {/* Product details section */}
        <div className="mb-3">
          {variantAttributes && (
            <span className="block text-xs text-gray-500 mb-1">
              <span className="font-medium">Variant:</span> {variantAttributes}
            </span>
          )}
          <span className="block text-xs text-gray-500">
            <span className="font-medium">ID:</span> #{productId}
          </span>
        </div>

        {/* Price section */}
        <div className={"flex items-center justify-start"}>
          <span className="text-lg text-gray-700 font-medium">
            {(quantity * currentPrice).toLocaleString("en-us", {
              minimumFractionDigits: 2,
            })}{" "}
            €
          </span>
          {dealPrice > 0 && price > dealPrice && (
            <span className="text-sm text-gray-400 line-through ml-2">
              {(quantity * price).toLocaleString("en-us", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </span>
          )}
          <span className="text-sm text-gray-500 ml-3">
            {quantity > 1
              ? `${quantity} x ${currentPrice.toLocaleString("en-us", {
                  maximumFractionDigits: 2,
                })} €`
              : ""}{" "}
          </span>
        </div>

        {/* Controls section */}
        <div className={"flex justify-between items-center mt-3"}>
          <Quantity onChange={handleQuantityChange} quantity={quantity} iconWidth={8} />
          <button
            onClick={() => dispatch(remove({ productId, variantId }))}
            className="size-10 cursor-pointer rounded-md flex items-center justify-center transition-all duration-300 border border-white hover:border-gray-200 hover:bg-gray-100 active:border-gray-300 active:bg-gray-200"
            title="Remove item"
          >
            <DeleteIcon width={16} className="stroke-gray-400 fill-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
