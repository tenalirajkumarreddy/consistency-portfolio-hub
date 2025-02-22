
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Download, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const Resume = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const { data: resume, isLoading, error, refetch } = useQuery({
    queryKey: ['resume'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching resume:', error);
        throw error;
      }
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // First upload the file to storage
      const fileName = file.name.replace(/[^\x00-\x7F]/g, '');
      const filePath = `${crypto.randomUUID()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Then create the database record
      const { error: dbError } = await supabase.from('resumes').insert({
        filename: fileName,
        file_path: filePath,
        content_type: file.type,
        size: file.size,
      });

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: 'Resume uploaded successfully',
      });

      refetch();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload resume: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!resume) return;

    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resume.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download resume: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <section className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Resume</h1>
          <p className="text-xl text-gray-600">
            View and manage your professional resume
          </p>
        </section>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="relative"
                disabled={isUploading}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload PDF'}
              </Button>
              {resume && (
                <Button
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Current Resume
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-[800px] bg-gray-200 rounded-lg" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load resume. Please try again later.
            </AlertDescription>
          </Alert>
        ) : resume ? (
          <Card>
            <CardHeader>
              <CardTitle>Current Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <iframe
                src={`${supabase.storage.from('resumes').getPublicUrl(resume.file_path).data.publicUrl}#toolbar=0`}
                className="w-full h-[800px] border rounded-lg"
                title="Resume Preview"
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default Resume;
