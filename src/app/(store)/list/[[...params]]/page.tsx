"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getList } from "@/actions/list/listServices";
import ProductCard from "@/components/store/common/productCard";
import Filters from "@/components/store/listPage/filters";
import NoItem from "@/components/store/listPage/noItem";
import Button from "@/components/UI/button";
import DropDownList from "@/components/UI/dropDown";
import LineList from "@/components/UI/lineList";
import { SK_Box } from "@/components/UI/skeleton";
import { sortDropdownData } from "@/data/uiElementsData";
import { cn } from "@/shared/utils/styling";
import { TListSort, TPageStatus } from "@/types/list";
import { TBrand, TFilterBrands, TFilters, TListItem, TProductPath } from "@/types/product";

const defaultFilters: TFilters = {
  stockStatus: "all",
  brands: [],
  priceMinMaxLimitation: [0, 0],
  priceMinMax: [0, 0],
};

const imgBaseUrl = process.env.IMG_URL;

const sortData: TListSort[] = [
  { sortName: "id", sortType: "desc" },
  { sortName: "id", sortType: "asc" },
  { sortName: "price", sortType: "desc" },
  { sortName: "price", sortType: "asc" },
  { sortName: "name", sortType: "asc" },
];

const ListPage = () => {
  const router = useRouter();
  const { params } = useParams<{ params: string[] }>();
  const pathName = usePathname();

  const [productList, setProductList] = useState<TListItem[]>([]);
  const [subCategories, setSubCategories] = useState<TProductPath[]>([]);

  const [sortIndex, setSortIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [filters, setFilters] = useState<TFilters>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<TFilters>({
    ...defaultFilters,
    priceMinMax: [...defaultFilters.priceMinMax],
  });

  const [isListLoading, setIsListLoading] = useState(true);

  useEffect(() => {
    const getProductsList = async () => {
      setIsListLoading(true);

      const response = await getList(pathName, sortData[sortIndex], appliedFilters);
      if (response.error || !response.products || !response.subCategories) return router.push("/");

      if (isFilterApplied) {
        setFilters(appliedFilters);
        setProductList(response.products);
        setIsListLoading(false);
      } else {
        const filtersFromDB = getFiltersFromProductList(response.products);
        setFilters(filtersFromDB);
        setSubCategories(response.subCategories);
        setProductList(response.products);

        setIsListLoading(false);
      }
    };

    getProductsList();
  }, [router, pathName, sortIndex, appliedFilters, isFilterApplied]);

  if (!params || params.length <= 0) router.push("/");

  const handleSortChange = (newIndex: number) => {
    setSortIndex(newIndex);
  };

  const toggleFiltersWindow = (visibility: boolean) => {
    setShowFilters(visibility);
    if (visibility) {
      document.documentElement.classList.add("noScroll");
    } else {
      document.documentElement.classList.remove("noScroll");
    }
  };

  const getPageHeader = () => {
    const pageName = params[params.length - 1].split("-");
    pageName.forEach((word, index) => {
      pageName[index] = word[0].toUpperCase() + word.slice(1);
    });

    return pageName.join(" ");
  };

  const getLink = (array: string[], index: number) => {
    let link = "/list";
    for (let i = 0; i <= index; i++) {
      link += "/" + array[i];
    }
    return link;
  };

  const handleBrandChange = (index: number) => {
    const newBrandList = JSON.parse(JSON.stringify(filters.brands));
    newBrandList[index].isSelected = !newBrandList[index].isSelected;
    setFilters({ ...filters, brands: newBrandList });
  };

  const defineFilterChangeStatus = () => {
    if (appliedFilters.stockStatus !== filters.stockStatus) return false;

    if (JSON.stringify(appliedFilters.brands) !== JSON.stringify(filters.brands)) return false;

    if (JSON.stringify(appliedFilters.priceMinMax) !== JSON.stringify(filters.priceMinMax)) return false;

    return true;
  };
  const isFilterChanged: boolean = defineFilterChangeStatus();
  const handleApplyFilter = () => {
    const newFilter: TFilters = {
      brands: JSON.parse(JSON.stringify(filters.brands)),
      priceMinMax: [...filters.priceMinMax],
      stockStatus: filters.stockStatus,
      priceMinMaxLimitation: [...filters.priceMinMaxLimitation],
    };
    setIsFilterApplied(true);
    setAppliedFilters(newFilter);
  };

  const handleResetFilters = () => {
    const newBrands: TFilterBrands[] = [];
    filters.brands.forEach((b) => newBrands.push({ id: b.id, name: b.name, isSelected: true }));
    const newFilter: TFilters = {
      brands: newBrands,
      priceMinMax: [...filters.priceMinMaxLimitation],
      stockStatus: "all",
      priceMinMaxLimitation: [...filters.priceMinMaxLimitation],
    };
    setIsFilterApplied(false);
    setAppliedFilters(newFilter);
  };

  const getPageStatus = (): TPageStatus => {
    if (isListLoading) {
      if (isFilterApplied) return "filterLoading";
      return "pageLoading";
    }

    if (productList.length > 0) return "filledProductList";

    if (isFilterApplied) return "filterHasNoProduct";

    return "categoryHasNoProduct";
  };
  const currentPageStatus: TPageStatus = getPageStatus();

  const pageStatusJSX = {
    pageLoading: <div className="flex flex-wrap gap-4 mt-7 ml-2 mb-[400px]">{SKL_Product().map((skl) => skl)}</div>,
    filterLoading: <div className="flex flex-wrap gap-4 mt-7 ml-2 mb-[400px]">{SKL_Product().map((skl) => skl)}</div>,
    filledProductList: (
      <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 gap-2 mb-14">
        {productList.map((product) => (
          <ProductCard
            key={product.id}
            imgUrl={[product.images[0], product.images[1]]}
            name={product.name}
            price={product.price}
            isAvailable={product.isAvailable}
            dealPrice={product.salePrice || undefined}
            specs={product.specialFeatures}
            url={"/product/" + product.id}
          />
        ))}
      </div>
    ),
    categoryHasNoProduct: <NoItem pageHeader={getPageHeader()} />,
    filterHasNoProduct: (
      <div className="flex flex-col items-center justify-center text-sm min-h-[400px] gap-4">
        <span> Không có sản phẩm nào!</span>
        <Button onClick={handleResetFilters} className="w-[200px]">
          Đặt lại bộ lọc
        </Button>
      </div>
    ),
  }[currentPageStatus];

  return (
    <div className="mt-[136px] bg-white">
      <div className="w-full h-auto md:h-[130px] py-5 px-2.5 md:p-0 flex mt-32 sm:mt-0 flex-col justify-center items-center bg-gray-200/80">
        <h1 className="text-2xl block font-light text-gray-900 mb-2">{getPageHeader()}</h1>
        <div className="flex gap-3 items-center text-sm">
          <Link
            href={"/"}
            className="text-gray-500 hover:text-gray-900  after:content-[''] after:w-1 after:h-2 after:ml-2 after:inline-block after:bg-no-repeat after:bg-center after:bg-[url('/icons/arrowIcon01.svg')] last:after:hidden"
          >
            Trang chủ
          </Link>
          {params.map((item, index) => (
            <Link
              className={cn(
                "after:w-1 after:h-2 after:ml-2 text-gray-500 after:inline-block after:bg-no-repeat after:bg-center after:bg-[url('/icons/arrowIcon01.svg')]",
                index === params.length - 1 && "after:w-0 text-gray-800"
              )}
              key={index}
              href={getLink(params, index)}
            >
              {item[0].toUpperCase() + item.slice(1)}
            </Link>
          ))}
        </div>
        <div className="h-auto md:h-7">
          {!!subCategories?.length && (
            <div className="flex gap-3 border border-gray-300 bg-gray-100 rounded-md mt-2 px-3 py-1 text-gray-400 text-sm">
              More:
              {subCategories.map((cat, index) => (
                <Link
                  href={pathName + "/" + cat.url}
                  key={index}
                  className="text-gray-500 hover:text-gray-900 after:content-[''] md:after:content-['-'] after:w-1 after:h-2 after:ml-2 after:inline-block after:bg-no-repeat after:bg-center last:after:hidden"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="storeContainer flex flex-col">
        <div className="flex visible lg:hidden w-full mt-3 px-3 justify-between">
          <button
            className="border border-gray-200 rounded-md cursor-pointer pr-5 py-2 pl-8 bg-white text-gray-700 text-sm tracking-[1px] bg-[url('/icons/filterIcon.svg')] bg-no-repeat bg-[position:10px_center] transition-all duration-300 hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200 active:border-gray-400"
            onClick={() => toggleFiltersWindow(true)}
          >
            BỘ LỌC
          </button>
          <DropDownList data={sortDropdownData} width="180px" selectedIndex={sortIndex} onChange={handleSortChange} />
        </div>
        <div className="w-full flex pt-3 lg:mt-9 md:pt-2">
          <Filters
            onToggleWindow={toggleFiltersWindow}
            showFilters={showFilters}
            filters={filters}
            onFilterChange={setFilters}
            onBrandChange={handleBrandChange}
            isFilterChanged={isFilterChanged}
            onApplyFilter={handleApplyFilter}
            pageStatus={currentPageStatus}
          />
          <div className="flex-grow flex flex-col ml-0 2xl:ml-4 lg:ml-3">
            <div className="w-full items-center text-sm mb-5 ml-3 hidden lg:flex">
              <Image src={"/icons/sortIcon.svg"} alt="Sắp xếp" width={16} height={12} className="mr-3" />
              <span className="font-medium w-14 mr-3 text-gray-900">Sắp xếp theo:</span>
              <LineList data={sortDropdownData} selectedId={sortIndex} onChange={handleSortChange} />
            </div>
            {pageStatusJSX}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListPage;

const SKL_Product = (): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    nodes.push(
      <div className="flex flex-col gap-3 w-[240px]" key={i}>
        <SK_Box width="100%" height="160px" />
        <SK_Box width="70%" height="26px" />
        <div className="flex flex-col gap-2">
          <SK_Box width="40%" height="12px" />
          <SK_Box width="40%" height="12px" />

          <SK_Box width="40%" height="12px" />
        </div>
        <SK_Box width="60%" height="20px" />
      </div>
    );
  }
  return nodes;
};

// -------- GET UNIQUE BRAND LIST FROM PRODUCT LIST --------
const getBrandsFromProducts = (productList: TListItem[]) => {
  return productList.map((product) => product.brand);
};
const removeDuplicatedBrands = (list: TBrand[]) => {
  const newList: TBrand[] = [];
  list.forEach((listItem) => {
    const isFind = newList.findIndex((brand) => listItem.id === brand.id);
    if (isFind === -1) newList.push({ id: listItem.id, name: listItem.name });
  });
  return newList;
};
const addIsSelectedValueToBrands = (brandList: TBrand[]) => {
  return brandList.map((b) => ({
    ...b,
    isSelected: true,
  }));
};
const generateBrands = (productList: TListItem[]) => {
  const listOfProductsBrand: TBrand[] = getBrandsFromProducts(productList);
  const uniqueBrandList = removeDuplicatedBrands(listOfProductsBrand);
  return addIsSelectedValueToBrands(uniqueBrandList);
};

// -------- GET PRICE LIMIT FROM PRODUCT LIST --------
const getPricesFromProducts = (productList: TListItem[]) => {
  return productList.map((product) => product.price);
};
const findMinMax = (array: number[]) => {
  const minMax: [number, number] = [Math.min(...array), Math.max(...array)];
  return minMax;
};
const roundMaxMinPricesWithMargin = (minMax: [number, number]) => {
  const roundedPrices: [number, number] = [...minMax];
  roundedPrices[0] = Math.floor(roundedPrices[0]);
  roundedPrices[0] = roundedPrices[0] - (roundedPrices[0] % 100);

  roundedPrices[1] = Math.ceil(roundedPrices[1]);
  roundedPrices[1] = roundedPrices[1] + (100 - (roundedPrices[1] % 100));
  return roundedPrices;
};
const getPriceLimit = (productList: TListItem[]) => {
  const allProductsPrices: number[] = getPricesFromProducts(productList);
  const minMaxValues = findMinMax(allProductsPrices);
  const roundedPrices = roundMaxMinPricesWithMargin(minMaxValues);

  return roundedPrices;
};

// -------- GET INITIAL FILTERS --------
const getFiltersFromProductList = (productsList: TListItem[]) => {
  const newFilter: TFilters = {
    brands: generateBrands(productsList),
    priceMinMax: getPriceLimit(productsList),
    priceMinMaxLimitation: getPriceLimit(productsList),
    stockStatus: "all",
  };
  return newFilter;
};
