import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { Button } from './button';
export function Dialog({ open, onOpenChange, title, description, children, panel = false }: { open: boolean; onOpenChange: (v: boolean) => void; title: string; description?: string; children: ReactNode; panel?: boolean }) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}><DialogPrimitive.Portal><DialogPrimitive.Overlay className="dialog-overlay"/><DialogPrimitive.Content className={panel ? 'dialog-panel' : 'dialog-content'} aria-describedby={description ? undefined : undefined}><div className="dialog-heading"><DialogPrimitive.Title>{title}</DialogPrimitive.Title><DialogPrimitive.Close asChild><Button variant="ghost" size="icon" aria-label="Закрыть">×</Button></DialogPrimitive.Close></div>{description ? <DialogPrimitive.Description>{description}</DialogPrimitive.Description> : <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>}{children}</DialogPrimitive.Content></DialogPrimitive.Portal></DialogPrimitive.Root>;
}
