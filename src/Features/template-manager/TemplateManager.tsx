'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchClients, selectClients, selectClientsLoading, selectClientsError } from '@/app/ClientSlice';
import DynamicForm from './DynamicForm';
import { BASE_URL } from '@/lib/constants';


const formSchema = z.object({
  templateName: z.string().min(1, 'Template name is required').trim(),
  templateJson: z.string().min(1, 'Template JSON is required').refine((val) => {
    try { JSON.parse(val); return true; } catch { return false; }
  }, 'Invalid JSON format'),
});

interface Template {
  id: number;
  name: string;
  description: string;
  template: string;
  tabs: Record<string, any>;
}

interface AssignedTemplate {
  groupCompanyName: string;
  templateId: number;
  templateName: string;
  groupCompanyId: number;
  status: string;
}

const TemplateManager = () => {
  const dispatch = useAppDispatch();
  const clients = useAppSelector(selectClients);
  const clientsLoading = useAppSelector(selectClientsLoading);
  const clientsError = useAppSelector(selectClientsError);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assignedTemplates, setAssignedTemplates] = useState<AssignedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const createForm = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { templateName: '', templateJson: '' },
  });

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(
        BASE_URL + '/api/template/list'
      );
      const templatesFromApi = response.data.map((item: any) => {
        const templateDef = item.templateJson[0] || {};
        return {
          id: item.id,
          name: item.templateName,
          description: item.description || '',
          template: templateDef.template || item.templateName,
          tabs: templateDef.tabs || {},
        };
      });
      setTemplates(templatesFromApi);
    } catch (error) {
      console.error('Failed to fetch templates', error);
    }
  };

  const fetchAssignedTemplates = async () => {
    try {
      const response = await axios.get(
        BASE_URL + '/api/template/assigned/all'
      );
      setAssignedTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch assigned templates', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchAssignedTemplates();
    dispatch(fetchClients());
  }, [dispatch]);

  const onCreateTemplate = async (data: any) => {
    try {
      await axios.post(
        BASE_URL + '/api/template/upsert',
        {
          templateName: data.templateName.trim(),
          templateJson: JSON.parse(data.templateJson),
        }
      );
      createForm.reset();
      alert('Template created successfully!');
      fetchTemplates();
    } catch (error: any) {
      console.error(error);
      alert('Failed to create template. Check console for details.');
    }
  };

  const handleAssign = async () => {
    if (!selectedClientId) {
      alert('Please select a client');
      return;
    }
    if (!selectedTemplateId) {
      alert('Please select a template');
      return;
    }
    try {
      await axios.post(
        BASE_URL + `/api/template/assign?groupCompanyId=${selectedClientId}&templateId=${selectedTemplateId}`
      );
      alert('Assigned to Client Successfully');
      await fetchAssignedTemplates(); // refresh the list of assignments
    } catch (error) {
      console.error(error);
      alert('Assignment failed');
    }
  };

  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  // When client changes, pre-select the template already assigned to this client (if any)
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const assignment = assignedTemplates.find(
      (item) => String(item.groupCompanyId) === clientId
    );
    if (assignment) {
      setSelectedTemplateId(String(assignment.templateId));
    } else {
      setSelectedTemplateId('');
    }
  };

  if (selectedTemplate) {
    return (
      <div className="h-screen w-full p-4">
        <Button
          onClick={() => setSelectedTemplate(null)}
          variant="outline"
          className="mb-4"
        >
          ← Back to Templates
        </Button>
        <DynamicForm template={selectedTemplate} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full p-4">
      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="assign">Assign</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-8">
          {/* Template List Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Available Templates</h2>
            {templates.length === 0 ? (
              <p className="text-gray-500">No templates available. Create one below.</p>
            ) : (
              <div className="flex flex-row overflow-x-auto gap-6 pb-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="min-w-[250px] flex-shrink-0 p-6 cursor-pointer hover:shadow-md transition-all duration-300"
                  >
                    <h3 className="text-xl text-center font-medium">{template.name}</h3>
                    {template.description && (
                      <p className="text-sm text-gray-500 text-center mt-2">{template.description}</p>
                    )}
                    <div className="flex justify-center mt-5">
                      <Button
                        onClick={() => handleViewTemplate(template)}
                        variant="outline"
                        className="px-4 py-1"
                      >
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Create New Template Section */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Template</h2>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateTemplate)} className="space-y-6">
                <FormField
                  control={createForm.control}
                  name="templateName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. chocolate, salon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="templateJson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template JSON</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`[{\n  "name": "My Template",\n  "tabs": { ... },\n  "description": "..."\n}]`}
                          className="min-h-[200px] font-mono text-sm resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit">Create Template</Button>
                </div>
              </form>
            </Form>
          </div>
        </TabsContent>




        

        <TabsContent value="assign" className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            {/* Client Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Client</label>
              {clientsError && <p className="text-xs text-red-500">Error: {clientsError}</p>}
              <Select value={selectedClientId} onValueChange={handleClientChange} disabled={clientsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={clientsLoading ? 'Loading clients…' : 'Choose a client'} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={String(client.id)}>
                      {client.groupCompanyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Templates as Radio Buttons */}
            {selectedClientId && (
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                <label className="text-sm font-medium text-gray-700">Select Template to Assign</label>
                {templates.length === 0 ? (
                  <p className="text-sm text-gray-500">No templates available.</p>
                ) : (
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <div key={template.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`template-${template.id}`}
                          name="templateRadio"
                          value={template.id}
                          checked={selectedTemplateId === String(template.id)}
                          onChange={(e) => setSelectedTemplateId(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`template-${template.id}`} className="text-sm text-gray-700">
                          {template.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleAssign} className="w-full" disabled={!selectedClientId}>
              Assign Template to Client
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateManager;