"use client";

import { ProductSpec, SpecGroup } from "@prisma/client";
import { useEffect, useState } from "react";

import { getAllBrands } from "@/actions/brands/brands";
import { getAllCategoriesJSON } from "@/actions/category/category";
import { getCategorySpecs } from "@/actions/category/specifications";
import Button from "@/components/UI/button";
import DropDownList from "@/components/UI/dropDown";
import Input from "@/components/UI/input";
import { cn } from "@/shared/utils/styling";
import { TGroupJSON } from "@/types/categories";
import { TAddProductFormValues, TBrand } from "@/types/product";
import { TDropDown } from "@/types/uiElements";
import ProductSunEditor from "../sunEditor";

const categoryListFirstItem: TDropDown = {
  text: "Select A Category....",
  value: "",
};

const brandListFirstItem: TDropDown = {
  text: "Select A Brand....",
  value: "",
};

type TProps = {
  formValues: TAddProductFormValues;
  onChange: (props: TAddProductFormValues) => void;
};

const ProductForm = ({ formValues: props, onChange }: TProps) => {
  const [categoryList, setCategoryList] = useState<TDropDown[]>([categoryListFirstItem]);
  const [brandList, setBrandList] = useState<TDropDown[]>([brandListFirstItem]);
  const [selectedCategoryListIndex, setSelectedCategoryListIndex] = useState(0);
  const [selectedBrandListIndex, setSelectedBrandListIndex] = useState(0);

  const [categorySpecs, setCategorySpecs] = useState<SpecGroup[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getAllCategoriesJSON();
      if (result.res) {
        const categoryDropdownList = convertJSONtoDropdownList(result.res);
        setCategoryList(categoryDropdownList);

        // Set selected category if one exists in props
        if (props.categoryID) {
          const categoryIndex = categoryDropdownList.findIndex((item) => item.value === props.categoryID);
          if (categoryIndex > -1) {
            setSelectedCategoryListIndex(categoryIndex);
            getSpecGroup(props.categoryID);
          }
        }
      }
    };

    const fetchBrands = async () => {
      const result = await getAllBrands();
      if (result.res) {
        const brandDropdownList = convertBrandsToDropdownList(result.res);
        setBrandList(brandDropdownList);

        // Set selected brand if one exists in props
        if (props.brandID) {
          const brandIndex = brandDropdownList.findIndex((item) => item.value === props.brandID);
          if (brandIndex > -1) {
            setSelectedBrandListIndex(brandIndex);
          }
        }
      }
    };

    const convertJSONtoDropdownList = (json: TGroupJSON[]): TDropDown[] => {
      const dropDownData: TDropDown[] = [categoryListFirstItem];
      json.forEach((group) => {
        dropDownData.push({
          text: group.group.name,
          value: group.group.id,
        });
        group.categories.forEach((category) => {
          dropDownData.push({
            text: group.group.name + " - " + category.category.name,
            value: category.category.id,
          });
          category.subCategories.forEach((sub) => {
            dropDownData.push({
              text: group.group.name + " - " + category.category.name + " - " + sub.name,
              value: sub.id,
            });
          });
        });
      });

      return dropDownData;
    };

    const convertBrandsToDropdownList = (brandList: TBrand[]): TDropDown[] => {
      const dropDownData: TDropDown[] = [brandListFirstItem];
      brandList.forEach((brand) => {
        dropDownData.push({
          text: brand.name,
          value: brand.id,
        });
      });

      return dropDownData;
    };

    fetchCategories();
    fetchBrands();
  }, [props.categoryID, props.brandID]); // Add dependencies

  const handleCategoryChange = (index: number) => {
    setSelectedCategoryListIndex(index);
    if (index === 0) {
      onChange({
        ...props,
        specifications: JSON.parse(JSON.stringify(props.specifications)),
        categoryID: "",
      });
      setCategorySpecs([]);
    } else {
      getSpecGroup(categoryList[index].value);
    }
  };

  const handleBrandChange = (index: number) => {
    setSelectedBrandListIndex(index);
    onChange({ ...props, brandID: brandList[index].value });
  };

  const getSpecGroup = async (categoryID: string) => {
    const response = await getCategorySpecs(categoryID);
    if (response.res) {
      const specArray: ProductSpec[] = [];
      response.res.forEach((item) => {
        specArray.push({
          specGroupID: item.id,
          specValues: item.specs.map(() => ""),
        });
      });
      onChange({
        ...props,
        specifications: JSON.parse(JSON.stringify(specArray)),
        categoryID: categoryID,
      });
      setCategorySpecs(response.res);
    }
  };

  const handleSpecialFeatureChange = (index: number, value: string) => {
    const newArray = [...props.specialFeatures];
    newArray[index] = value;
    onChange({ ...props, specialFeatures: newArray });
  };

  return (
    <div className="flex flex-col overflow-y-auto max-h-[80vh] p-6 rounded-xl bg-white z-10 text-sm w-[900px]">
      <div className="grid grid-col-4 gap-4 w-full">
        <div className="flex items-center justify-between">
          <span className="min-w-[150px]">Name:</span>
          <Input
            type="text"
            className="w-[650px]"
            value={props.name}
            placeholder="Name..."
            onChange={(e) =>
              onChange({
                ...props,
                name: e.currentTarget.value,
              })
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="min-w-[150px]">Short Descriptions:</span>
          <Input
            type="text"
            className="w-[650px]"
            value={props.desc}
            onChange={(e) =>
              onChange({
                ...props,
                desc: e.currentTarget.value,
              })
            }
            placeholder="Short Description..."
          />
        </div>

        <div className="flex flex-col w-full mt-4">
          <span className="min-w-[150px] mb-2">Product Detailed Description:</span>
          <ProductSunEditor
            value={props.richDesc || ""}
            onChange={(content) =>
              onChange({
                ...props,
                richDesc: content,
              })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="min-w-[150px]">Special Features:</span>
          <div className="flex flex-col gap-2 w-[650px]">
            <Input
              type="text"
              value={props.specialFeatures[0]}
              onChange={(e) => handleSpecialFeatureChange(0, e.currentTarget.value)}
            />
            <Input
              type="text"
              value={props.specialFeatures[1]}
              onChange={(e) => handleSpecialFeatureChange(1, e.currentTarget.value)}
            />
            <Input
              type="text"
              value={props.specialFeatures[2]}
              onChange={(e) => handleSpecialFeatureChange(2, e.currentTarget.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="min-w-[150px]">Price:</span>
          <Input
            type="number"
            className="w-[650px]"
            value={props.price}
            onChange={(e) =>
              onChange({
                ...props,
                price: e.currentTarget.value,
              })
            }
            placeholder="0.00€"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="min-w-[150px]">Sale Price:</span>
          <Input
            type="number"
            className="w-[650px]"
            value={props.salePrice}
            onChange={(e) =>
              onChange({
                ...props,
                salePrice: e.currentTarget.value,
              })
            }
            placeholder="0.00€"
          />
        </div>
        <div className="flex items-center justify-between">
          <span>Is In Stock:</span>
          <div className="flex gap-2 items-center">
            <span
              className={cn(
                "select-none border rounded-sm px-3 py-1 ml-1 transition-colors duration-300",
                props.isAvailable
                  ? "text-gray-100 bg-green-500 border-green-500"
                  : "cursor-pointer hover:bg-gray-100 border border-gray-200"
              )}
              onClick={() => onChange({ ...props, isAvailable: true })}
            >
              In Stock
            </span>
            <span
              className={cn(
                "select-none border rounded-sm px-3 py-1 ml-1 transition-colors duration-300",
                !props.isAvailable
                  ? "text-gray-100 bg-red-500 hover:bg-red-500 border-red-500"
                  : "cursor-pointer hover:bg-gray-100 border border-gray-200"
              )}
              onClick={() => onChange({ ...props, isAvailable: false })}
            >
              Out Of Stock
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="min-w-[150px]">Brand:</span>
          <DropDownList
            data={brandList}
            width="650px"
            selectedIndex={selectedBrandListIndex}
            onChange={handleBrandChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="min-w-[150px]">Images:</span>
          <div className="flex flex-col gap-2 w-[650px] justify-between">
            {props.images.map((img, index) => (
              <Input
                key={index}
                type="text"
                value={img}
                onChange={(e) => {
                  props.images[index] = e.currentTarget.value;
                  onChange({ ...props });
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                props.images.push("");
                onChange({ ...props });
              }}
            >
              +
            </Button>
            <Button
              onClick={() => {
                props.images.pop();
                onChange({ ...props });
              }}
            >
              -
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="min-w-[150px]">Category</span>
          <DropDownList
            data={categoryList}
            width="650px"
            selectedIndex={selectedCategoryListIndex}
            onChange={handleCategoryChange}
          />
        </div>
      </div>
      <div className="mt-5 border-t border-gray-200 w-full h-auto py-4 flex flex-col">
        <span className="text-base mb-4">Specifications:</span>
        <div className="flex-grow flex flex-col items-start gap-4 mb-6 w-full">
          {categorySpecs.length ? (
            <>
              {categorySpecs.map((specGroup, groupIndex) => (
                <div className="w-full flex flex-col p-3 rounded-md border border-gray-300" key={specGroup.id}>
                  <span className="w-full pb-3 mb-3 border-b border-gray-200">{specGroup.title}</span>
                  <>
                    {specGroup.specs.map((spec, specIndex) => (
                      <div
                        className="w-full flex items-center justify-between p-2 pl-4 rounded-md transition-colors duration-600 hover:bg-gray-100"
                        key={specIndex}
                      >
                        <span className="min-w-[150px]">{spec}</span>
                        <Input
                          type="text"
                          className="w-[650px]"
                          value={props.specifications[groupIndex]?.specValues[specIndex]}
                          onChange={(e) => {
                            props.specifications[groupIndex].specValues[specIndex] = e.currentTarget.value;
                            onChange({ ...props });
                          }}
                        />
                      </div>
                    ))}
                  </>
                </div>
              ))}
            </>
          ) : (
            <span>Can not Find! </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
