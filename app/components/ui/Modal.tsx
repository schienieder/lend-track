'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export default function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fade-in" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Content className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 data-[state=open]:animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          {description && (
            <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {description}
            </Dialog.Description>
          )}
          {children}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
