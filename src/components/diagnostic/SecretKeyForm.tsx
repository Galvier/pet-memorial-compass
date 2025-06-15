
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Save, ExternalLink } from 'lucide-react';

interface SecretKeyFormProps {
  title: string;
  secretName: string;
  placeholder: string;
  description: string;
  helpUrl?: string;
  helpText?: string;
  onSave: (secretName: string) => void;
  isLoading?: boolean;
}

export const SecretKeyForm: React.FC<SecretKeyFormProps> = ({
  title,
  secretName,
  placeholder,
  description,
  helpUrl,
  helpText,
  onSave,
  isLoading = false
}) => {
  const [showKey, setShowKey] = useState(false);
  const [keyValue, setKeyValue] = useState('');

  const handleSave = () => {
    if (keyValue.trim()) {
      onSave(secretName);
      setKeyValue(''); // Limpar o campo após salvar
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            {description}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor={secretName}>Chave da API</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id={secretName}
                type={showKey ? "text" : "password"}
                placeholder={placeholder}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowKey(!showKey)}
                disabled={isLoading}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={!keyValue.trim() || isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>

        {helpText && helpUrl && (
          <div className="p-3 bg-gray-50 rounded text-sm">
            <p className="font-medium mb-1">Como obter a chave:</p>
            <p className="mb-2">{helpText}</p>
            <a 
              href={helpUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 underline flex items-center gap-1"
            >
              Acessar painel <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
