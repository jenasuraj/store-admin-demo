import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';



const ArrayTextInput = ({
  value = [],
  onAdd,
  onRemove,
  placeholder,
}: {
  value: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  placeholder?: string;
}) => {
  const [inputValue, setInputValue] = useState('');

  const commit = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((item, idx) => (
          <span
            key={idx}
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="hover:text-red-600 font-bold text-lg leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder || 'Type and press Enter'}
          className="flex-1"
        />
        <button
          type="button"
          onClick={commit}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Add
        </button>
      </div>
    </div>
  );
};

interface DynamicFormProps {
  template: {
    id: number;
    name: string;
    description: string;
    tabs: Record<string, any>;
  };
}

const DynamicForm = ({ template }: DynamicFormProps) => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [dynamicImageFields, setDynamicImageFields] = useState<number[]>([0]);

  const setField = (tab: string, field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [tab]: { ...prev[tab], [field]: value } }));
  };

  const addArrayItem = (tab: string, field: string, value: string) => {
    if (!value.trim()) return;
    const current = formData[tab]?.[field] || [];
    setField(tab, field, [...current, value.trim()]);
  };

  const removeArrayItem = (tab: string, field: string, index: number) => {
    const current = formData[tab]?.[field] || [];
    setField(
      tab,
      field,
      current.filter((_: any, i: number) => i !== index)
    );
  };

  const handleImageChange = (index: number, file: File | null) => {
    const current = formData.gallery?.galleryImages || [];
    const updated = [...current];
    updated[index] = file ? file.name : '';
    setField('gallery', 'galleryImages', updated);
  };

  const renderField = (field: any, tabName: string) => {
    const value = formData[tabName]?.[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={field.name} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              type={field.type}
              value={value || ''}
              placeholder={field.placeholder}
              onChange={(e) => setField(tabName, field.name, e.target.value)}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label>{field.label}</Label>
            <Textarea
              rows={4}
              value={value || ''}
              placeholder={field.placeholder}
              onChange={(e) => setField(tabName, field.name, e.target.value)}
            />
          </div>
        );

      case 'time':
        return (
          <div key={field.name} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              type="time"
              value={value || ''}
              onChange={(e) => setField(tabName, field.name, e.target.value)}
            />
          </div>
        );

      case 'array-text':
        return (
          <div key={field.name} className="space-y-2">
            <Label>{field.label}</Label>
            <ArrayTextInput
              value={value || []}
              onAdd={(v) => addArrayItem(tabName, field.name, v)}
              onRemove={(i) => removeArrayItem(tabName, field.name, i)}
              placeholder={field.placeholder}
            />
          </div>
        );

      case 'image':
        return (
          <div key={field.name} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setField(tabName, field.name, f.name);
              }}
            />
            {value && <p className="text-sm text-green-600">Selected: {value}</p>}
          </div>
        );

      case 'dynamic-images':
        return (
          <div key={field.name} className="space-y-4">
            <Label>{field.label}</Label>
            {dynamicImageFields.map((_, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageChange(index, e.target.files?.[0] || null)
                    }
                  />
                  {value?.[index] && (
                    <p className="text-sm text-green-600 mt-1">
                      Selected: {value[index]}
                    </p>
                  )}
                </div>
                {dynamicImageFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDynamicImageFields((prev) =>
                        prev.filter((_, i) => i !== index)
                      );
                      handleImageChange(index, null);
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setDynamicImageFields((prev) => [...prev, prev.length])}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              + Add More Images
            </button>
          </div>
        );

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              type="text"
              value={value || ''}
              placeholder={field.placeholder}
              onChange={(e) => setField(tabName, field.name, e.target.value)}
            />
          </div>
        );
    }
  };

  const tabKeys = Object.keys(template.tabs);
  const currentTab = template.tabs[activeTab || tabKeys[0]];

  // Set first tab as active if none selected
  if (!activeTab && tabKeys.length > 0) {
    setActiveTab(tabKeys[0]);
    return null;
  }

  return (
    <Card className="h-[90vh] w-full shadow-xl bg-gray-50 flex flex-col">
      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex gap-2 overflow-x-auto">
          {tabKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-all whitespace-nowrap
                ${
                  activeTab === key
                    ? 'bg-black text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {template.tabs[key].label}
            </button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentTab?.fields.map((field: any) => renderField(field, activeTab))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white rounded-b-lg flex justify-end">
        <button
          onClick={() => console.log('Form Data:', formData)}
          className="px-6 py-2 bg-black text-white rounded-sm hover:bg-gray-800"
        >
          Submit Response
        </button>
      </div>
    </Card>
  );
};

export default DynamicForm;