'use client';

import { useState } from 'react';
import { GeneratedResume } from '@/lib/gemini';

interface ResumeEditorProps {
  resume: GeneratedResume;
  onUpdate: (updatedResume: GeneratedResume) => void;
  onCancel: () => void;
}

export default function ResumeEditor({ resume, onUpdate, onCancel }: ResumeEditorProps) {
  const [editedResume, setEditedResume] = useState<GeneratedResume>(resume);
  const [activeSection, setActiveSection] = useState<string>('personalInfo');

  const updateField = (section: string, field: string, value: any) => {
    setEditedResume(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof GeneratedResume],
        [field]: value,
      },
    }));
  };

  const updateArrayField = (section: string, index: number, field: string, value: any) => {
    setEditedResume(prev => {
      const sectionData = prev[section as keyof GeneratedResume] as any[];
      const updated = [...sectionData];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        [section]: updated,
      };
    });
  };

  const addArrayItem = (section: string, template: any) => {
    setEditedResume(prev => ({
      ...prev,
      [section]: [...(prev[section as keyof GeneratedResume] as any[]), template],
    }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setEditedResume(prev => {
      const sectionData = prev[section as keyof GeneratedResume] as any[];
      return {
        ...prev,
        [section]: sectionData.filter((_, i) => i !== index),
      };
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Edit Resume</h2>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onUpdate(editedResume)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {[
          { id: 'personalInfo', label: 'Personal Info' },
          { id: 'summary', label: 'Summary' },
          { id: 'workExperience', label: 'Experience' },
          { id: 'education', label: 'Education' },
          { id: 'skills', label: 'Skills' },
          { id: 'projects', label: 'Projects' },
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeSection === section.id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Personal Info */}
      {activeSection === 'personalInfo' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editedResume.personalInfo.name}
              onChange={(e) => updateField('personalInfo', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={editedResume.personalInfo.email}
              onChange={(e) => updateField('personalInfo', 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={editedResume.personalInfo.phone}
              onChange={(e) => updateField('personalInfo', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={editedResume.personalInfo.location}
              onChange={(e) => updateField('personalInfo', 'location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn (optional)</label>
            <input
              type="url"
              value={editedResume.personalInfo.linkedin || ''}
              onChange={(e) => updateField('personalInfo', 'linkedin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub (optional)</label>
            <input
              type="url"
              value={editedResume.personalInfo.github || ''}
              onChange={(e) => updateField('personalInfo', 'github', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Summary */}
      {activeSection === 'summary' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
          <textarea
            value={editedResume.summary}
            onChange={(e) => setEditedResume(prev => ({ ...prev, summary: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Work Experience */}
      {activeSection === 'workExperience' && (
        <div className="space-y-4">
          {editedResume.workExperience.map((exp, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">Experience #{index + 1}</h3>
                <button
                  onClick={() => removeArrayItem('workExperience', index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => updateArrayField('workExperience', index, 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateArrayField('workExperience', index, 'company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => updateArrayField('workExperience', index, 'duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Jan 2020 - Present"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateArrayField('workExperience', index, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Achievements (one per line)</label>
                <textarea
                  value={exp.achievements.join('\n')}
                  onChange={(e) => updateArrayField('workExperience', index, 'achievements', e.target.value.split('\n').filter(l => l.trim()))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Achievement 1&#10;Achievement 2"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => addArrayItem('workExperience', {
              company: '',
              position: '',
              duration: '',
              description: '',
              achievements: [],
            })}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            + Add Experience
          </button>
        </div>
      )}

      {/* Education */}
      {activeSection === 'education' && (
        <div className="space-y-4">
          {editedResume.education.map((edu, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">Education #{index + 1}</h3>
                <button
                  onClick={() => removeArrayItem('education', index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateArrayField('education', index, 'degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateArrayField('education', index, 'institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={edu.fieldOfStudy}
                    onChange={(e) => updateArrayField('education', index, 'fieldOfStudy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
                  <input
                    type="text"
                    value={edu.graduationDate}
                    onChange={(e) => updateArrayField('education', index, 'graduationDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="2020"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => addArrayItem('education', {
              institution: '',
              degree: '',
              fieldOfStudy: '',
              graduationDate: '',
            })}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            + Add Education
          </button>
        </div>
      )}

      {/* Skills */}
      {activeSection === 'skills' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
          <textarea
            value={editedResume.skills.join(', ')}
            onChange={(e) => setEditedResume(prev => ({
              ...prev,
              skills: e.target.value.split(',').map(s => s.trim()).filter(s => s),
            }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Python, JavaScript, React, SQL..."
          />
        </div>
      )}

      {/* Projects */}
      {activeSection === 'projects' && (
        <div className="space-y-4">
          {(editedResume.projects || []).map((project, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900">Project #{index + 1}</h3>
                <button
                  onClick={() => removeArrayItem('projects', index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateArrayField('projects', index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => updateArrayField('projects', index, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={project.technologies.join(', ')}
                    onChange={(e) => updateArrayField('projects', index, 'technologies', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={() => addArrayItem('projects', {
              name: '',
              description: '',
              technologies: [],
            })}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            + Add Project
          </button>
        </div>
      )}
    </div>
  );
}

