import { type ComponentType } from 'react';
import { Input, TextArea, Select, Checkbox, Toggle } from '../ui';
import { RichTextField } from './RichTextField';
import { JsonField } from './JsonField';
import { TagSelector } from './TagSelector';
import { ImageUpload } from './ImageUpload';

export const FIELD_REGISTRY: Record<string, ComponentType<any>> = {
  text: Input,
  textarea: TextArea,
  select: Select,
  checkbox: Checkbox,
  toggle: Toggle,
  'rich-text': RichTextField,
  json: JsonField,
  tags: TagSelector,
  image: ImageUpload,
};

interface DynamicFieldProps {
  type: string;
  [key: string]: any;
}

export function DynamicField({ type, ...props }: DynamicFieldProps) {
  const Component = FIELD_REGISTRY[type];
  if (!Component) {
    return <p className="text-xs text-danger">Unknown field type: {type}</p>;
  }
  return <Component {...props} />;
}
