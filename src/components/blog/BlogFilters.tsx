"use client";

import { useState } from "react";
import { Topic } from "@/types/blog";

interface BlogFiltersProps {
  topics: Topic[];
  selectedTopic: string | null;
  onTopicChange: (topicSlug: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const BlogFilters = ({ topics, selectedTopic, onTopicChange, searchQuery, onSearchChange }: BlogFiltersProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      {/* Search */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Search Articles</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Topics Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => onTopicChange(null)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTopic === null
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            All Articles
            <span className="float-right text-xs text-gray-500">
              {topics.reduce((sum, topic) => sum + (topic._count?.posts || 0), 0)}
            </span>
          </button>
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => onTopicChange(topic.slug)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTopic === topic.slug
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {topic.name}
              <span className="float-right text-xs text-gray-500">{topic._count?.posts || 0}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogFilters;
