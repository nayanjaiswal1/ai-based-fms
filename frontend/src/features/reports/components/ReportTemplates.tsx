import { useState } from 'react';
import { useReportTemplates } from '../hooks/useReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileText, TrendingUp, BarChart3, PieChart, DollarSign } from 'lucide-react';

const categoryIcons: Record<string, any> = {
  financial: DollarSign,
  comparison: TrendingUp,
  analysis: BarChart3,
  investment: PieChart,
  group: FileText,
};

const categoryColors: Record<string, string> = {
  financial: 'bg-blue-100 text-blue-800',
  comparison: 'bg-green-100 text-green-800',
  analysis: 'bg-purple-100 text-purple-800',
  investment: 'bg-indigo-100 text-indigo-800',
  group: 'bg-pink-100 text-pink-800',
};

export default function ReportTemplates({ onClose }: { onClose?: () => void }) {
  const { templates, isLoading, createFromTemplate, isCreating } = useReportTemplates();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customName, setCustomName] = useState('');

  const categories = ['all', ...new Set(templates.map((t) => t.category))];

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleCreateFromTemplate = () => {
    if (selectedTemplate) {
      createFromTemplate(
        { type: selectedTemplate.type, name: customName || selectedTemplate.name },
        {
          onSuccess: () => {
            setSelectedTemplate(null);
            setCustomName('');
            onClose?.();
          },
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const Icon = categoryIcons[template.category] || FileText;
                return (
                  <Card
                    key={template.type}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={categoryColors[template.category]}
                        >
                          {template.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-3">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Report from Template</DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                placeholder={selectedTemplate?.name}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Leave blank to use template name
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFromTemplate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
