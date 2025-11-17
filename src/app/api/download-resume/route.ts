import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import { createClient } from '@/lib/supabase-server';
import { logInfo, logError, logPerformance, trackAPICall } from '@/lib/monitoring';

// Template-specific styling configurations
const TEMPLATE_STYLES = {
  classic: {
    headerColor: [0, 0, 0], // Black
    accentColor: [0, 0, 0],
    headerFontSize: 16,
    sectionFontSize: 11,
    bodyFontSize: 9,
    lineHeight: 4.5,
    sectionSpacing: 6,
  },
  modern: {
    headerColor: [37, 99, 235], // Blue
    accentColor: [37, 99, 235],
    headerFontSize: 15,
    sectionFontSize: 10,
    bodyFontSize: 9,
    lineHeight: 4.2,
    sectionSpacing: 5,
  },
  creative: {
    headerColor: [147, 51, 234], // Purple
    accentColor: [236, 72, 153], // Pink
    headerFontSize: 15,
    sectionFontSize: 10,
    bodyFontSize: 9,
    lineHeight: 4.2,
    sectionSpacing: 5,
  },
  tech: {
    headerColor: [34, 197, 94], // Green
    accentColor: [34, 197, 94],
    headerFontSize: 15,
    sectionFontSize: 10,
    bodyFontSize: 9,
    lineHeight: 4.2,
    sectionSpacing: 5,
  },
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    logInfo('Resume download request', {
      userId: user?.id,
      email: user?.email,
    }, user?.id);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const resumeData = body.resume || body;
    const templateId = body.templateId || 'classic';
    
    const style = TEMPLATE_STYLES[templateId as keyof typeof TEMPLATE_STYLES] || TEMPLATE_STYLES.classic;
    
    // Create PDF in portrait mode (standard US Letter: 8.5 x 11 inches)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter', // 8.5 x 11 inches
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth(); // ~215.9mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // ~279.4mm
    const margin = 15; // Reduced margins for more space
    const maxY = pageHeight - margin;
    let yPosition = margin;
    
    // Helper function to check if we need to truncate content
    const checkSpace = (requiredSpace: number): boolean => {
      return yPosition + requiredSpace <= maxY;
    };
    
    // Helper function to add text with word wrap and auto-sizing
    const addText = (
      text: string, 
      fontSize: number = style.bodyFontSize, 
      isBold: boolean = false,
      color: number[] = [0, 0, 0],
      maxLines: number = 10
    ) => {
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      const linesToAdd = lines.slice(0, maxLines);
      
      linesToAdd.forEach((line: string, index: number) => {
        if (!checkSpace(style.lineHeight)) {
          return; // Stop if no space
        }
        pdf.text(line, margin, yPosition);
        yPosition += style.lineHeight;
      });
      
      if (lines.length > maxLines) {
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(fontSize - 1);
        pdf.text('...', margin, yPosition);
        yPosition += style.lineHeight;
      }
      
      yPosition += 1; // Small spacing after text block
    };
    
    // Helper function to add section header
    const addSectionHeader = (text: string) => {
      if (!checkSpace(style.sectionSpacing + style.lineHeight * 2)) {
        return false;
      }
      yPosition += style.sectionSpacing;
      pdf.setDrawColor(style.accentColor[0], style.accentColor[1], style.accentColor[2]);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 3;
      addText(text.toUpperCase(), style.sectionFontSize, true, style.accentColor);
      return true;
    };
    
    // Header Section - Compact
    if (resumeData.personalInfo) {
      const { name, email, phone, location, linkedin, github } = resumeData.personalInfo;
      
      // Name
      pdf.setFontSize(style.headerFontSize);
      pdf.setTextColor(style.headerColor[0], style.headerColor[1], style.headerColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text(name, margin, yPosition);
      yPosition += style.lineHeight + 2;
      
      // Contact info - compact single line
      const contactInfo = [email, phone, location].filter(Boolean).join(' • ');
      pdf.setFontSize(style.bodyFontSize - 1);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.text(contactInfo, margin, yPosition);
      yPosition += style.lineHeight;
      
      // Social links - compact
      const socialLinks: string[] = [];
      if (linkedin) socialLinks.push(`LinkedIn: ${linkedin}`);
      if (github) socialLinks.push(`GitHub: ${github}`);
      if (socialLinks.length > 0) {
        pdf.setFontSize(style.bodyFontSize - 1);
        pdf.text(socialLinks.join(' • '), margin, yPosition);
        yPosition += style.lineHeight;
      }
      
      yPosition += 3;
    }
    
    // Summary - Compact (max 3 lines)
    if (resumeData.summary && checkSpace(style.lineHeight * 4)) {
      if (addSectionHeader('PROFESSIONAL SUMMARY')) {
        const summaryLines = pdf.splitTextToSize(resumeData.summary, pageWidth - 2 * margin);
        const summaryToShow = summaryLines.slice(0, 3).join(' ');
        addText(summaryToShow, style.bodyFontSize, false, [0, 0, 0], 3);
      }
    }
    
    // Work Experience - Limit to 2-3 most recent, compact format
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
      if (addSectionHeader('PROFESSIONAL EXPERIENCE')) {
        const experiences = resumeData.workExperience.slice(0, 2); // Limit to 2 most recent
        
        experiences.forEach((exp: any, index: number) => {
          if (!checkSpace(style.lineHeight * 8)) return; // Check space for one entry
          
          // Position and Company on same line
          pdf.setFontSize(style.bodyFontSize);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          const positionText = `${exp.position}`;
          pdf.text(positionText, margin, yPosition);
          
          // Company and duration on right side
          const companyDuration = `${exp.company} | ${exp.duration || ''}`;
          const companyWidth = pdf.getTextWidth(companyDuration);
          pdf.setFont('helvetica', 'normal');
          pdf.text(companyDuration, pageWidth - margin - companyWidth, yPosition);
          yPosition += style.lineHeight + 1;
          
          // Description - compact (max 2 lines)
          if (exp.description) {
            const descLines = pdf.splitTextToSize(exp.description, pageWidth - 2 * margin);
            descLines.slice(0, 2).forEach((line: string) => {
              if (checkSpace(style.lineHeight)) {
                pdf.setFontSize(style.bodyFontSize - 1);
                pdf.text(line, margin + 2, yPosition);
                yPosition += style.lineHeight;
              }
            });
          }
          
          // Achievements - limit to 2 most important
          if (exp.achievements && exp.achievements.length > 0 && checkSpace(style.lineHeight * 3)) {
            exp.achievements.slice(0, 2).forEach((achievement: string) => {
              if (checkSpace(style.lineHeight)) {
                pdf.setFontSize(style.bodyFontSize - 1);
                pdf.text(`• ${achievement}`, margin + 2, yPosition);
                yPosition += style.lineHeight;
              }
            });
          }
          
          yPosition += 2;
        });
      }
    }
    
    // Education - Compact, single line per entry
    if (resumeData.education && resumeData.education.length > 0) {
      if (addSectionHeader('EDUCATION')) {
        resumeData.education.slice(0, 2).forEach((edu: any) => {
          if (!checkSpace(style.lineHeight * 2)) return;
          
          const eduText = `${edu.degree} in ${edu.fieldOfStudy}, ${edu.institution}, ${edu.graduationDate}`;
          pdf.setFontSize(style.bodyFontSize);
          pdf.setFont('helvetica', 'bold');
          pdf.text(eduText, margin, yPosition);
          yPosition += style.lineHeight + 1;
        });
      }
    }
    
    // Skills - Compact, in columns if space allows
    if (resumeData.skills && resumeData.skills.length > 0) {
      if (addSectionHeader('TECHNICAL SKILLS')) {
        if (checkSpace(style.lineHeight * 3)) {
          const skillsText = resumeData.skills.slice(0, 15).join(' • '); // Limit skills
          const skillLines = pdf.splitTextToSize(skillsText, pageWidth - 2 * margin);
          skillLines.slice(0, 2).forEach((line: string) => {
            if (checkSpace(style.lineHeight)) {
              pdf.setFontSize(style.bodyFontSize);
              pdf.setFont('helvetica', 'normal');
              pdf.text(line, margin, yPosition);
              yPosition += style.lineHeight;
            }
          });
        }
      }
    }
    
    // Projects - Compact, limit to 1-2 most relevant
    if (resumeData.projects && resumeData.projects.length > 0 && checkSpace(style.lineHeight * 6)) {
      if (addSectionHeader('PROJECTS')) {
        resumeData.projects.slice(0, 1).forEach((project: any) => {
          if (!checkSpace(style.lineHeight * 4)) return;
          
          pdf.setFontSize(style.bodyFontSize);
          pdf.setFont('helvetica', 'bold');
          pdf.text(project.name, margin, yPosition);
          yPosition += style.lineHeight;
          
          if (project.description) {
            const descLines = pdf.splitTextToSize(project.description, pageWidth - 2 * margin);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(style.bodyFontSize - 1);
            descLines.slice(0, 2).forEach((line: string) => {
              if (checkSpace(style.lineHeight)) {
                pdf.text(line, margin + 2, yPosition);
                yPosition += style.lineHeight;
              }
            });
          }
        });
      }
    }
    
    // Generate PDF buffer
    const pdfBuffer = pdf.output('arraybuffer');
    
    const duration = Date.now() - startTime;
    logPerformance('pdf_generation', duration, {
      userId: user?.id,
      templateId,
    });
    
    trackAPICall('/api/download-resume', 'POST', duration, 200);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${templateId}.pdf"`,
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('Error generating PDF:', error);
    
        logError('PDF generation failed', error, {
          duration,
        });
    
    trackAPICall('/api/download-resume', 'POST', duration, 500);
    
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
