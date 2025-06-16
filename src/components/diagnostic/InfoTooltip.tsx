
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InfoTooltipProps {
  tooltipText: string;
  dialogTitle: string;
  dialogContent: React.ReactNode;
  size?: 'sm' | 'md';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  tooltipText,
  dialogTitle,
  dialogContent,
  size = 'sm'
}) => {
  const [open, setOpen] = useState(false);
  
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <button className="inline-flex items-center justify-center">
                <Info className={`${iconSize} text-muted-foreground hover:text-primary transition-colors cursor-help`} />
              </button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-48">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
        
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              {dialogTitle}
            </DialogTitle>
            <DialogDescription>
              Explicação detalhada sobre como este cálculo funciona
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {dialogContent}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
