'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = [
    {
      id: 'classic',
      name: 'Classic Professional',
      description: 'Clean and traditional design perfect for corporate positions and conservative industries',
      category: 'Professional',
      preview: 'classic',
      color: 'bg-gray-600',
      features: ['ATS Optimized', 'Traditional Layout', 'Corporate Ready'],
    },
    {
      id: 'modern',
      name: 'Modern Minimalist',
      description: 'Contemporary design with clean lines and modern typography for forward-thinking professionals',
      category: 'Modern',
      preview: 'modern',
      color: 'bg-blue-600',
      features: ['Clean Design', 'Modern Typography', 'Versatile'],
    },
    {
      id: 'creative',
      name: 'Creative Portfolio',
      description: 'Bold design ideal for creative professionals, designers, and artists',
      category: 'Creative',
      preview: 'creative',
      color: 'bg-purple-600',
      features: ['Eye-Catching', 'Colorful', 'Creative Fields'],
    },
    {
      id: 'tech',
      name: 'Tech Specialist',
      description: 'Technical layout optimized for software engineers, developers, and tech professionals',
      category: 'Technical',
      preview: 'tech',
      color: 'bg-green-600',
      features: ['Tech Focused', 'Code-Inspired', 'Developer Friendly'],
    },
  ];

  const categories = ['all', 'Professional', 'Modern', 'Creative', 'Technical'];

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Template
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select from our collection of professionally designed resume templates. Each template is optimized for different industries and career levels.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 animate-slide-up">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {filteredTemplates.map((template, index) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Preview Area */}
              <div className={`${template.color} h-64 flex items-center justify-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                <div className="relative z-10 text-center text-white p-6">
                  <div className="w-32 h-40 bg-white/20 backdrop-blur-sm rounded-lg mx-auto mb-4 flex items-center justify-center border-2 border-white/30">
                    <div className="text-4xl font-bold opacity-80">{template.name.charAt(0)}</div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{template.name}</h3>
                  <p className="text-sm opacity-90">{template.category}</p>
                </div>
              </div>
              
              {/* Template Info */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 min-h-[3rem]">
                  {template.description}
                </p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {template.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/generate?template=${template.id}`}
                    className={`flex-1 ${template.color} hover:opacity-90 text-white text-center py-3 px-4 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    Use Template
                  </Link>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-4 rounded-lg transition-all duration-200 font-semibold">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Don&apos;t see what you&apos;re looking for?
            </h2>
            <p className="text-gray-600 mb-6">
              More templates are coming soon! In the meantime, our AI can help customize any template to your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/generate"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Start Building
              </Link>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-lg transition-all duration-200 font-semibold">
                Request Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
