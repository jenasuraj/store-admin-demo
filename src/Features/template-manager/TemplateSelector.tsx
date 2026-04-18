'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BASE_URL } from '@/lib/constants';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useAppDispatch,useAppSelector } from '@/app/hooks';
import {
  fetchClients,
  selectClients,
  selectClientsLoading,
  selectClientsError,
} from '@/app/ClientSlice';



interface TemplateItem {
  id: number;
  name: string;
  description: string;
  template: string;
  tabs: Record<string, any>;
}

interface TemplateSelectorProps {
  templates: TemplateItem[];
  onSelect: (template: TemplateItem) => void;
  onTemplateCreated: () => void;
}


const formSchema = z.object({
  templateName: z.string().min(1, 'Template name is required').trim(),
  templateJson: z
    .string()
    .min(1, 'Template JSON is required')
    .refine((val) => {
      try { JSON.parse(val); return true; } catch { return false; }
    }, 'Invalid JSON format'),
});






const TemplateSelector = ({ templates, onSelect, onTemplateCreated }: TemplateSelectorProps) => {

  const dispatch = useAppDispatch();
  const clients = useAppSelector(selectClients);
  const clientsLoading = useAppSelector(selectClientsLoading);
  const clientsError = useAppSelector(selectClientsError);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [templateId,setTemplateId] = useState<number | null>(null)
  

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { templateName: '', templateJson: '' },
  });

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  const onSubmit = async (data: any) => {
    try {
      await axios.post(
        'https://store-admin-uat.actifyzone.com/store-uat/api/template/upsert',
        {
          templateName: data.templateName.trim(),
          templateJson: JSON.parse(data.templateJson),
        }
      );
      form.reset();
      alert('Template created successfully!');
      onTemplateCreated();
    } catch (error: any) {
      console.error(error);
      alert('Failed to create template. Check console for details.');
    } finally {
    }
  };


  const handleAssign = (id:number)=>{
    if(templateId == id){
      setTemplateId(null)
    }
    else{
    console.log("clicked...",id)
    setTemplateId(id)
    }
  }



  const handleTemplateToClient = async(templateId: number, clientId: string) => {
  console.log("Assigning:", { templateId, clientId });
  const response = await axios.post(BASE_URL + `/api/template/assign?groupCompanyId=${clientId}&templateId=${templateId}`)
  //console.log("response is",response)
  if(response.data){
    alert("Assigned to Client Successfully")
  }
 };



  const ClientSelect = () => (
    <div className="space-y-1 mt-5">
      <label className="text-sm font-medium text-gray-700">Select Client</label>
      {clientsError && (
        <p className="text-xs text-red-500">Error: {clientsError}</p>
      )}
      <Select
          value={selectedClientId}
          onValueChange={(value) => {
            setSelectedClientId(value);

            if (templateId !== null) {
              handleTemplateToClient(templateId, value);
            }
          }}
          disabled={clientsLoading}
        >
        <SelectTrigger className="w-full">
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
  );


  return (
    <div className="h-screen w-full flex items-center justify-center p-4 mt-14">
      <div className="w-full max-w-4xl space-y-8">

        {/* Choose a Template */}
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Choose a Template</h2>
          {templates.length === 0 ? (
            <p className="text-gray-500">No templates available. Create one below.</p>
          ) : (
            <div className="flex flex-row overflow-x-auto gap-6">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="min-w-[250px] flex-shrink-0 p-6 cursor-pointer bg-gray-50 hover:shadow-sm rounded-none transition-all duration-300">
                  <h3 className="text-xl text-center font-medium">{template.name}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-500 text-center mt-2">{template.description}</p>
                  )}
                  <div className='flex flex-row gap-5 mt-5 justify-center items-center'>
                  <button onClick={() => onSelect(template)} className='px-3 py-1 bg-white rounded-sm text-black border border-gray-300 cursor-pointer duration-300 transition-all'>View</button>
                  <button onClick={()=>handleAssign(template.id)} className={`${templateId == template.id ? 'bg-black text-white' : 'bg-white border border-gray-300 text-black'} px-3 cursor-pointer duration-300 transition-all py-1 rounded-sm`}>Assign</button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          {templateId ? <ClientSelect /> : " "}
        </div>

        {/* Create New Template */}
        <div className="border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Create New Template</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
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
                <Button type="submit" className="px-6">
                  Create Template
                </Button>
              </div>
            </form>
          </Form>
        </div>

      </div>
    </div>
  );
};

export default TemplateSelector;