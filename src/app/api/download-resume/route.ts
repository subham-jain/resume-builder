import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resumeData = await request.json();
    
    // Create PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;
    
    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont(undefined, 'bold');
      } else {
        pdf.setFont(undefined, 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 6;
      });
      yPosition += 2;
    };

    // Header
    if (resumeData.personalInfo) {
      const { name, email, phone, location, linkedin, github } = resumeData.personalInfo;
      
      addText(name, 18, true);
      addText(`${email} | ${phone} | ${location}`, 10);
      if (linkedin) addText(`LinkedIn: ${linkedin}`, 10);
      if (github) addText(`GitHub: ${github}`, 10);
      yPosition += 10;
    }

    // Summary
    if (resumeData.summary) {
      addText('PROFESSIONAL SUMMARY', 14, true);
      addText(resumeData.summary, 11);
      yPosition += 5;
    }

    // Work Experience
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
      addText('PROFESSIONAL EXPERIENCE', 14, true);
      resumeData.workExperience.forEach((exp: any) => {
        addText(`${exp.position} at ${exp.company}`, 12, true);
        addText(exp.duration, 10);
        addText(exp.description, 11);
        if (exp.achievements && exp.achievements.length > 0) {
          exp.achievements.forEach((achievement: string) => {
            addText(`• ${achievement}`, 10);
          });
        }
        yPosition += 5;
      });
      yPosition += 5;
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      addText('EDUCATION', 14, true);
      resumeData.education.forEach((edu: any) => {
        addText(`${edu.degree} in ${edu.fieldOfStudy}`, 12, true);
        addText(`${edu.institution}, ${edu.graduationDate}`, 11);
        yPosition += 5;
      });
      yPosition += 5;
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      addText('TECHNICAL SKILLS', 14, true);
      addText(resumeData.skills.join(', '), 11);
      yPosition += 5;
    }

    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      addText('PROJECTS', 14, true);
      resumeData.projects.forEach((project: any) => {
        addText(project.name, 12, true);
        addText(project.description, 11);
        if (project.technologies && project.technologies.length > 0) {
          addText(`Technologies: ${project.technologies.join(', ')}`, 10);
        }
        yPosition += 5;
      });
    }

    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
