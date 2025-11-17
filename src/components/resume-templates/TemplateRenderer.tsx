'use client';

import { GeneratedResume } from '@/lib/gemini';

interface TemplateRendererProps {
  resume: GeneratedResume;
  templateId: string;
}

export default function TemplateRenderer({ resume, templateId }: TemplateRendererProps) {
  const renderTemplate = () => {
    switch (templateId) {
      case 'classic':
        return <ClassicTemplate resume={resume} />;
      case 'modern':
        return <ModernTemplate resume={resume} />;
      case 'creative':
        return <CreativeTemplate resume={resume} />;
      case 'tech':
        return <TechTemplate resume={resume} />;
      default:
        return <ClassicTemplate resume={resume} />;
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-lg overflow-hidden">
      {renderTemplate()}
    </div>
  );
}

// Classic Professional Template
function ClassicTemplate({ resume }: { resume: GeneratedResume }) {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {resume.personalInfo.name}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <span>{resume.personalInfo.email}</span>
          <span>•</span>
          <span>{resume.personalInfo.phone}</span>
          <span>•</span>
          <span>{resume.personalInfo.location}</span>
          {resume.personalInfo.linkedin && (
            <>
              <span>•</span>
              <span>{resume.personalInfo.linkedin}</span>
            </>
          )}
          {resume.personalInfo.github && (
            <>
              <span>•</span>
              <span>{resume.personalInfo.github}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {resume.workExperience && resume.workExperience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {resume.workExperience.map((exp, idx) => (
              <div key={idx} className="mb-4">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-gray-700 font-medium">{exp.company}</p>
                  </div>
                  <span className="text-gray-600 text-sm">{exp.duration}</span>
                </div>
                <p className="text-gray-700 mb-2">{exp.description}</p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    {exp.achievements.map((achievement, aIdx) => (
                      <li key={aIdx}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">
            Education
          </h2>
          <div className="space-y-3">
            {resume.education.map((edu, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-gray-700">{edu.institution} • {edu.fieldOfStudy}</p>
                <p className="text-gray-600 text-sm">{edu.graduationDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">
            Projects
          </h2>
          <div className="space-y-4">
            {resume.projects.map((project, idx) => (
              <div key={idx}>
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <p className="text-gray-700 mb-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Modern Minimalist Template
function ModernTemplate({ resume }: { resume: GeneratedResume }) {
  return (
    <div className="p-10 max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="text-center mb-8 pb-6 border-b-2 border-blue-500">
        <h1 className="text-4xl font-light text-gray-900 mb-3 tracking-wide">
          {resume.personalInfo.name}
        </h1>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
          <span>{resume.personalInfo.email}</span>
          <span>•</span>
          <span>{resume.personalInfo.phone}</span>
          <span>•</span>
          <span>{resume.personalInfo.location}</span>
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed text-center italic">{resume.summary}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Work Experience */}
          {resume.workExperience && resume.workExperience.length > 0 && (
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4 border-l-4 border-blue-500 pl-3">
                Experience
              </h2>
              <div className="space-y-5">
                {resume.workExperience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{exp.position}</h3>
                        <p className="text-blue-600">{exp.company}</p>
                      </div>
                      <span className="text-gray-500 text-sm">{exp.duration}</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{exp.description}</p>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="list-none text-gray-700 text-sm space-y-1">
                        {exp.achievements.map((achievement, aIdx) => (
                          <li key={aIdx} className="flex items-start">
                            <span className="text-blue-500 mr-2">▸</span>
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4 border-l-4 border-blue-500 pl-3">
                Projects
              </h2>
              <div className="space-y-4">
                {resume.projects.map((project, idx) => (
                  <div key={idx}>
                    <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                    <p className="text-gray-700 text-sm">{project.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <div>
              <h2 className="text-xl font-light text-gray-900 mb-3 border-b border-gray-300 pb-2">
                Education
              </h2>
              <div className="space-y-3">
                {resume.education.map((edu, idx) => (
                  <div key={idx}>
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-sm text-gray-600">{edu.institution}</p>
                    <p className="text-xs text-gray-500">{edu.graduationDate}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <div>
              <h2 className="text-xl font-light text-gray-900 mb-3 border-b border-gray-300 pb-2">
                Skills
              </h2>
              <div className="space-y-2">
                {resume.skills.map((skill, idx) => (
                  <div key={idx} className="text-sm text-gray-700">
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Creative Template
function CreativeTemplate({ resume }: { resume: GeneratedResume }) {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-lg mb-6">
        <h1 className="text-4xl font-bold mb-2">{resume.personalInfo.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm">
          <span>{resume.personalInfo.email}</span>
          <span>•</span>
          <span>{resume.personalInfo.phone}</span>
          <span>•</span>
          <span>{resume.personalInfo.location}</span>
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="bg-white p-5 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold text-purple-700 mb-2">About Me</h2>
          <p className="text-gray-700">{resume.summary}</p>
        </div>
      )}

      {/* Work Experience */}
      {resume.workExperience && resume.workExperience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Work Experience</h2>
          <div className="space-y-4">
            {resume.workExperience.map((exp, idx) => (
              <div key={idx} className="bg-white p-5 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.position}</h3>
                    <p className="text-purple-600 font-medium">{exp.company}</p>
                  </div>
                  <span className="text-gray-600 text-sm bg-purple-100 px-3 py-1 rounded-full">
                    {exp.duration}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{exp.description}</p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-none space-y-1">
                    {exp.achievements.map((achievement, aIdx) => (
                      <li key={aIdx} className="text-gray-700 flex items-start">
                        <span className="text-pink-500 mr-2">★</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Skills Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {resume.education && resume.education.length > 0 && (
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-purple-700 mb-3">Education</h2>
            {resume.education.map((edu, idx) => (
              <div key={idx} className="mb-3">
                <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                <p className="text-gray-700">{edu.institution}</p>
                <p className="text-sm text-gray-600">{edu.graduationDate}</p>
              </div>
            ))}
          </div>
        )}

        {resume.skills && resume.skills.length > 0 && (
          <div className="bg-white p-5 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-purple-700 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {resume.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Projects</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {resume.projects.map((project, idx) => (
              <div key={idx} className="bg-white p-5 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Tech Specialist Template
function TechTemplate({ resume }: { resume: GeneratedResume }) {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="border-l-4 border-green-400 pl-4 mb-8">
        <h1 className="text-4xl font-mono font-bold text-green-400 mb-2">
          {resume.personalInfo.name}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-400 font-mono">
          <span>{resume.personalInfo.email}</span>
          <span>|</span>
          <span>{resume.personalInfo.phone}</span>
          <span>|</span>
          <span>{resume.personalInfo.location}</span>
          {resume.personalInfo.github && (
            <>
              <span>|</span>
              <span className="text-green-400">{resume.personalInfo.github}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-8 bg-gray-800 p-4 rounded border border-gray-700">
          <h2 className="text-green-400 font-mono font-bold mb-2">// SUMMARY</h2>
          <p className="text-gray-300">{resume.summary}</p>
        </div>
      )}

      {/* Skills - Prominent for Tech */}
      {resume.skills && resume.skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-green-400 font-mono font-bold mb-4 text-xl">// SKILLS</h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-green-900 text-green-300 px-3 py-1 rounded font-mono text-sm border border-green-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Work Experience */}
      {resume.workExperience && resume.workExperience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-green-400 font-mono font-bold mb-4 text-xl">// EXPERIENCE</h2>
          <div className="space-y-5">
            {resume.workExperience.map((exp, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{exp.position}</h3>
                    <p className="text-green-400 font-mono">{exp.company}</p>
                  </div>
                  <span className="text-gray-500 text-sm font-mono">{exp.duration}</span>
                </div>
                <p className="text-gray-300 mb-2 text-sm">{exp.description}</p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="list-none space-y-1">
                    {exp.achievements.map((achievement, aIdx) => (
                      <li key={aIdx} className="text-gray-400 text-sm flex items-start">
                        <span className="text-green-400 mr-2 font-mono">→</span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-green-400 font-mono font-bold mb-4 text-xl">// PROJECTS</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {resume.projects.map((project, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded border border-gray-700">
                <h3 className="text-white font-bold mb-2">{project.name}</h3>
                <p className="text-gray-400 text-sm mb-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="bg-gray-700 text-green-400 px-2 py-1 rounded text-xs font-mono"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <div>
          <h2 className="text-green-400 font-mono font-bold mb-4 text-xl">// EDUCATION</h2>
          {resume.education.map((edu, idx) => (
            <div key={idx} className="bg-gray-800 p-4 rounded border border-gray-700 mb-3">
              <h3 className="text-white font-bold">{edu.degree}</h3>
              <p className="text-gray-400">{edu.institution} • {edu.fieldOfStudy}</p>
              <p className="text-gray-500 text-sm font-mono">{edu.graduationDate}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

