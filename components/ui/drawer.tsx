'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface DrawerContextType {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const DrawerContext = React.createContext<DrawerContextType | undefined>(undefined);

function useDrawer() {
    const context = React.useContext(DrawerContext);
    if (!context) {
        throw new Error("Drawer components must be used within a Drawer");
    }
    return context;
}

interface DrawerProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

function Drawer({ open: controlledOpen, onOpenChange, children }: DrawerProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
    const setOpen = onOpenChange || setUncontrolledOpen;

    return (
        <DrawerContext.Provider value={{ open, setOpen }}>
            {children}
        </DrawerContext.Provider>
    );
}

interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
}

function DrawerTrigger({ children, asChild, ...props }: DrawerTriggerProps) {
    const { setOpen } = useDrawer();

    return (
        <button onClick={() => setOpen(true)} {...props}>
            {children}
        </button>
    );
}

function DrawerClose({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { setOpen } = useDrawer();

    return (
        <button onClick={() => setOpen(false)} {...props}>
            {children}
        </button>
    );
}

interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
    side?: 'left' | 'right';
}

function DrawerContent({ children, className, side = 'right', ...props }: DrawerContentProps) {
    const { open, setOpen } = useDrawer();

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed z-50 bg-background shadow-lg transition-transform duration-300 ease-in-out",
                    side === 'right' ? 'inset-y-0 right-0' : 'inset-y-0 left-0',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </>
    );
}

function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col space-y-1.5 p-6 border-b", className)}
            {...props}
        />
    );
}

function DrawerTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2
            className={cn("text-lg font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    );
}

function DrawerDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
}

function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t", className)}
            {...props}
        />
    );
}

export {
    Drawer,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
}
