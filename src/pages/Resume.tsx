
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

      if (error) throw error;
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
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/functions/v1/upload-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      toast({
        title: 'Success',
        description: 'Resume uploaded successfully',
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload resume',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!resume) return;

    const { data, error } = await supabase.storage
      .from('resumes')
      .download(resume.file_path);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to download resume',
        variant: 'destructive',
      });
      return;
    }

    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = resume.filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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

        {error ? (
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
