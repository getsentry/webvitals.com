"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { AnimatePresence, motion, type Transition } from "motion/react";
import * as React from "react";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";
import { cn } from "@/lib/utils";

const tabsVariants = tv({
  slots: {
    tabsRoot: "",
    tabsList:
      "inline-flex h-9 items-center justify-center p-1 text-muted-foreground",
    tabsTrigger:
      "inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-sm font-medium disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    tabsContent:
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  },
  variants: {
    variant: {
      default: {
        tabsRoot: "",
        tabsList: "rounded-lg bg-muted",
        tabsTrigger:
          "ring-offset-background rounded-lg transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        tabsContent: "",
      },
      motion: {
        tabsRoot: "relative",
        tabsList: "inline-flex h-9 items-center justify-center",
        tabsTrigger:
          "relative px-6 py-1.5 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground",
        tabsContent: "",
      },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const transition: Transition = {
  type: "spring",
  duration: 0.3,
  bounce: 0.1,
};

interface TabsContextValue {
  activeValue?: string;
  focused?: string | null;
  setFocused: (focused: TabsContextValue["focused"]) => void;
  variant: VariantProps<typeof tabsVariants>["variant"];
}

const TabsContext = React.createContext<TabsContextValue | undefined>(
  undefined,
);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (context === undefined) {
    throw new Error("useTabsContext must be used within a TabsProvider");
  }
  return context;
};

interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Tabs>,
    VariantProps<typeof tabsVariants> {}

const Tabs = ({ value: activeValue, variant, ...rest }: TabsProps) => {
  const [focused, setFocused] =
    React.useState<TabsContextValue["focused"]>(null);
  const { tabsRoot } = tabsVariants({ variant });

  return (
    <TabsContext.Provider value={{ activeValue, focused, setFocused, variant }}>
      <TabsPrimitive.Root
        className={cn(tabsRoot())}
        value={activeValue}
        {...rest}
      />
    </TabsContext.Provider>
  );
};

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, ...props }, ref) => {
  const { setFocused, variant } = useTabsContext();
  const { tabsList } = tabsVariants({ variant });

  return (
    <TabsPrimitive.List
      onMouseLeave={() => setFocused(null)}
      ref={ref}
      className={cn(tabsList(), className)}
      {...props}
    />
  );
});

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, value, ...props }, ref) => {
  const { focused, setFocused, activeValue, variant } = useTabsContext();
  const { tabsTrigger } = tabsVariants({ variant });

  return (
    <TabsPrimitive.Trigger
      onMouseOver={() => setFocused(value)}
      onFocus={() => setFocused(value)}
      value={value}
      ref={ref}
      className={cn(tabsTrigger(), className)}
      {...props}
    >
      <span className="z-[2]">{children}</span>

      {variant === "motion" && (
        <>
          {activeValue === value && (
            <motion.div
              layout
              layoutId="tabs-underline"
              transition={transition}
              className="absolute w-full bg-foreground -bottom-[6px] h-[2px]"
            />
          )}
          <AnimatePresence mode="popLayout" initial={false}>
            {focused === value && (
              <motion.div
                layout
                layoutId="tabs-background"
                initial={{ opacity: 0, filter: "blur(1px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(1px)" }}
                transition={transition}
                className="absolute inset-0 bg-foreground/10 rounded-sm"
              />
            )}
          </AnimatePresence>
        </>
      )}
    </TabsPrimitive.Trigger>
  );
});

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
