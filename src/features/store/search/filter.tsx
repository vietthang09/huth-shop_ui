"use client";

import { findAll, TCategory } from "@/services/category";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Filter() {
  const [categories, setCategories] = useState<TCategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await findAll();
      if (res.status === 200) {
        setCategories(res.data);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <ul className="bg-[#f4f5fa] rounded-xl overflow-hidden divide-y divide-gray-300">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link href="#" className="p-3 flex items-center justify-between hover:bg-gray-200">
              <span className="font-bold">{category.title}</span>{" "}
              <span className="text-gray-500 text-xs font-semibold">{Math.round(Math.random() * 1000)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
