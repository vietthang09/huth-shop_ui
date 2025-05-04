"use client";

import { ProductSpec, SpecGroup } from "@prisma/client";
import { HexColorPicker } from "react-colorful";
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

const ProductForm = ({ formValues, onChange }: TProps) => {
  const [categoryList, setCategoryList] = useState<TDropDown[]>([categoryListFirstItem]);
  const [brandList, setBrandList] = useState<TDropDown[]>([brandListFirstItem]);
  const [selectedCategoryListIndex, setSelectedCategoryListIndex] = useState(0);
  const [selectedBrandListIndex, setSelectedBrandListIndex] = useState(0);

  const [categorySpecs, setCategorySpecs] = useState<SpecGroup[]>([]);

  // Add state to control color picker visibility
  const [showFromColorPicker, setShowFromColorPicker] = useState(false);
  const [showToColorPicker, setShowToColorPicker] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getAllCategoriesJSON();
      if (result.res) {
        const categoryDropdownList = convertJSONtoDropdownList(result.res);
        setCategoryList(categoryDropdownList);

        // Set selected category if one exists in formValues
        if (formValues.categoryID) {
          const categoryIndex = categoryDropdownList.findIndex((item) => item.value === formValues.categoryID);
          if (categoryIndex > -1) {
            setSelectedCategoryListIndex(categoryIndex);
            getSpecGroup(formValues.categoryID);
          }
        }
      }
    };

    const fetchBrands = async () => {
      const result = await getAllBrands();
      if (result.res) {
        const brandDropdownList = convertBrandsToDropdownList(result.res);
        setBrandList(brandDropdownList);

        // Set selected brand if one exists in formValues
        if (formValues.brandID) {
          const brandIndex = brandDropdownList.findIndex((item) => item.value === formValues.brandID);
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
  }, [formValues.categoryID, formValues.brandID]);

  const handleCategoryChange = (index: number) => {
    setSelectedCategoryListIndex(index);
    if (index === 0) {
      onChange({
        ...formValues,
        specifications: JSON.parse(JSON.stringify(formValues.specifications)),
        categoryID: "",
      });
      setCategorySpecs([]);
    } else {
      getSpecGroup(categoryList[index].value);
    }
  };

  const handleBrandChange = (index: number) => {
    setSelectedBrandListIndex(index);
    onChange({ ...formValues, brandID: brandList[index].value });
  };

  const getSpecGroup = async (categoryID: string) => {
    const response = await getCategorySpecs(categoryID);
    if (response.res) {
      const specArray: ProductSpec[] = [];

      // Create a map of existing spec values by specGroupID for quick lookup
      const existingSpecsMap = new Map();
      if (formValues.specifications && formValues.specifications.length > 0) {
        formValues.specifications.forEach((spec) => {
          existingSpecsMap.set(spec.specGroupID, spec.specValues);
        });
      }

      response.res.forEach((item) => {
        // Check if we have existing values for this specGroupID
        const existingValues = existingSpecsMap.get(item.id);

        // Make sure we have enough values to match the specs array length
        let specValues = item.specs.map(() => "");
        if (existingValues && Array.isArray(existingValues)) {
          // Only use existing values if array length matches
          if (existingValues.length === item.specs.length) {
            specValues = existingValues;
          } else if (existingValues.length > 0) {
            // Try to preserve existing values, but ensure correct length
            specValues = item.specs.map((_, idx) => (idx < existingValues.length ? existingValues[idx] : ""));
          }
        }

        specArray.push({
          specGroupID: item.id,
          specValues: specValues,
        });
      });

      onChange({
        ...formValues,
        specifications: JSON.parse(JSON.stringify(specArray)),
        categoryID: categoryID,
      });
      setCategorySpecs(response.res);
    }
  };

  const handleSpecialFeatureChange = (index: number, value: string) => {
    const newArray = [...formValues.specialFeatures];
    newArray[index] = value;
    onChange({ ...formValues, specialFeatures: newArray });
  };

  return (
    <form className="w-full flex flex-col gap-4 px-3 mt-3 overflow-y-auto">
      <div className="grid grid-col-4 gap-4 w-full">
        <div className="flex items-center justify-between">
          <span className="min-w-[150px]">Name:</span>
          <Input
            type="text"
            className="w-[650px]"
            value={formValues.name}
            placeholder="Name..."
            onChange={(e) =>
              onChange({
                ...formValues,
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
            value={formValues.desc}
            onChange={(e) =>
              onChange({
                ...formValues,
                desc: e.currentTarget.value,
              })
            }
            placeholder="Short Description..."
          />
        </div>

        <div className="flex flex-col w-full mt-4">
          <span className="min-w-[150px] mb-2">Product Detailed Description:</span>
          <ProductSunEditor
            value={formValues.richDesc || ""}
            onChange={(content) =>
              onChange({
                ...formValues,
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
              value={formValues.specialFeatures[0]}
              onChange={(e) => handleSpecialFeatureChange(0, e.currentTarget.value)}
            />
            <Input
              type="text"
              value={formValues.specialFeatures[1]}
              onChange={(e) => handleSpecialFeatureChange(1, e.currentTarget.value)}
            />
            <Input
              type="text"
              value={formValues.specialFeatures[2]}
              onChange={(e) => handleSpecialFeatureChange(2, e.currentTarget.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="min-w-[150px]">Price:</span>
          <Input
            type="number"
            className="w-[650px]"
            value={formValues.price}
            onChange={(e) =>
              onChange({
                ...formValues,
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
            value={formValues.salePrice}
            onChange={(e) =>
              onChange({
                ...formValues,
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
                formValues.isAvailable
                  ? "text-gray-100 bg-green-500 border-green-500"
                  : "cursor-pointer hover:bg-gray-100 border border-gray-200"
              )}
              onClick={() => onChange({ ...formValues, isAvailable: true })}
            >
              In Stock
            </span>
            <span
              className={cn(
                "select-none border rounded-sm px-3 py-1 ml-1 transition-colors duration-300",
                !formValues.isAvailable
                  ? "text-gray-100 bg-red-500 hover:bg-red-500 border-red-500"
                  : "cursor-pointer hover:bg-gray-100 border border-gray-200"
              )}
              onClick={() => onChange({ ...formValues, isAvailable: false })}
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
            {formValues.images.map((img, index) => (
              <Input
                key={index}
                type="text"
                value={img}
                onChange={(e) => {
                  formValues.images[index] = e.currentTarget.value;
                  onChange({ ...formValues });
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                formValues.images.push("");
                onChange({ ...formValues });
              }}
            >
              +
            </Button>
            <Button
              onClick={() => {
                formValues.images.pop();
                onChange({ ...formValues });
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

      <div className="flex items-center justify-between">
        <span className="min-w-[150px]">Gradient Colors:</span>
        <div className="flex gap-4 items-center w-[650px]">
          <div className="flex flex-col relative">
            <span className="text-sm mb-1">From Color:</span>
            <div className="flex items-center">
              <div
                className="w-10 h-10 border rounded-md cursor-pointer"
                style={{ backgroundColor: formValues.fromColor || "#000000" }}
                onClick={() => setShowFromColorPicker(!showFromColorPicker)}
              />
              <Input
                type="text"
                className="ml-2 w-28"
                value={formValues.fromColor || ""}
                onChange={(e) => {
                  onChange({ ...formValues, fromColor: e.currentTarget.value });
                }}
              />
            </div>
            {showFromColorPicker && (
              <div className="absolute top-full left-0 z-10 shadow-lg mt-2">
                <HexColorPicker
                  color={formValues.fromColor || "#000000"}
                  onChange={(color) => {
                    // Create a new copy of formValues to ensure state updates correctly
                    onChange({
                      ...formValues,
                      fromColor: color,
                    });
                  }}
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-white rounded-full p-1 shadow"
                  onClick={() => setShowFromColorPicker(false)}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col relative">
            <span className="text-sm mb-1">To Color:</span>
            <div className="flex items-center">
              <div
                className="w-10 h-10 border rounded-md cursor-pointer"
                style={{ backgroundColor: formValues.toColor || "#000000" }}
                onClick={() => setShowToColorPicker(!showToColorPicker)}
              />
              <Input
                type="text"
                className="ml-2 w-28"
                value={formValues.toColor || ""}
                onChange={(e) => {
                  onChange({ ...formValues, toColor: e.currentTarget.value });
                }}
              />
            </div>
            {showToColorPicker && (
              <div className="absolute top-full left-0 z-10 shadow-lg mt-2">
                <HexColorPicker
                  color={formValues.toColor || "#000000"}
                  onChange={(color) => {
                    // Create a new copy of formValues to ensure state updates correctly
                    onChange({
                      ...formValues,
                      toColor: color,
                    });
                  }}
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-white rounded-full p-1 shadow"
                  onClick={() => setShowToColorPicker(false)}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div
            className="w-32 h-20 ml-4 rounded-md border"
            style={{
              background: `linear-gradient(to top, ${formValues.fromColor || "#000000"}, ${
                formValues.toColor || "#000000"
              })`,
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white text-xs">Preview</div>
          </div>
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
                          value={formValues.specifications[groupIndex]?.specValues[specIndex]}
                          onChange={(e) => {
                            formValues.specifications[groupIndex].specValues[specIndex] = e.currentTarget.value;
                            onChange({ ...formValues });
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
    </form>
  );
};

export default ProductForm;
