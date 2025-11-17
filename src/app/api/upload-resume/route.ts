import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { logInfo, logError, logPerformance, trackAPICall } from '@/lib/monitoring';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    logInfo('Resume upload request', {
      userId: user?.id,
      email: user?.email,
    }, user?.id);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let textContent = '';

    // Extract text based on file type
    try {
      if (file.type === 'text/plain') {
        textContent = buffer.toString('utf-8');
      } else if (file.type === 'application/pdf') {
        // Extract text from PDF
        const pdfData = await pdfParse(buffer);
        textContent = pdfData.text;
        
        if (!textContent || textContent.trim().length === 0) {
          return NextResponse.json(
            { error: 'Could not extract text from PDF. The PDF might be image-based or encrypted. Please try a different file or copy-paste the text.' },
            { status: 400 }
          );
        }
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        // Extract text from DOCX/DOC
        try {
          const result = await mammoth.extractRawText({ buffer });
          textContent = result.value;
          
          if (result.messages.length > 0) {
            console.warn('DOCX extraction warnings:', result.messages);
          }
        } catch (docError: any) {
          // If mammoth fails, try alternative approach for older DOC files
          if (file.type === 'application/msword') {
            return NextResponse.json(
              { error: 'Older .doc format is not fully supported. Please convert to .docx or PDF, or upload as TXT file.' },
              { status: 400 }
            );
          }
          throw docError;
        }
      }

      // Clean up extracted text
      textContent = textContent
        .replace(/\r\n/g, '\n') // Normalize line breaks
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
        .trim();

      if (!textContent || textContent.length < 50) {
        return NextResponse.json(
          { error: 'File appears to be empty or too short. Please ensure the file contains resume content (at least 50 characters).' },
          { status: 400 }
        );
      }

      const duration = Date.now() - startTime;
      logPerformance('file_upload', duration, {
        userId: user?.id,
        fileType: file.type,
        fileSize: file.size,
      });
      
      trackAPICall('/api/upload-resume', 'POST', duration, 200);

      return NextResponse.json({
        success: true,
        textContent: textContent,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        characterCount: textContent.length,
      });
    } catch (extractionError: any) {
      const duration = Date.now() - startTime;
      console.error('Text extraction error:', extractionError);
      
      logError('Text extraction failed', extractionError, {
        duration,
        userId: user?.id,
        fileType: file.type,
      });
      
      trackAPICall('/api/upload-resume', 'POST', duration, 500);
      
      return NextResponse.json(
        { 
          error: 'Failed to extract text from file',
          details: extractionError.message,
          suggestion: 'Please try converting the file to plain text (TXT) format or copy-paste the content directly.'
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('Error uploading resume:', error);
    
    logError('File upload failed', error, {
      duration,
    });
    
    trackAPICall('/api/upload-resume', 'POST', duration, 500);
    
    return NextResponse.json(
      { error: 'Failed to process uploaded file', details: error.message },
      { status: 500 }
    );
  }
}
