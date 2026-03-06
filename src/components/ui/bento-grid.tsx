import { cn } from "@/utils/cn";

export const BentoGrid = ({
 className,
 children,
}: {
 className?: string;
 children?: React.ReactNode;
}) => {
 return (
  <div
   className={cn(
    "grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto",
    className
   )}
  >
   {children}
  </div>
 );
};

export const BentoGridItem = ({
 className,
 title,
 description,
 header,
 icon,
}: {
 className?: string;
 title?: string | React.ReactNode;
 description?: string | React.ReactNode;
 header?: React.ReactNode;
 icon?: React.ReactNode;
}) => {
 return (
  <div
   className={cn(
    "row-span-1 rounded-[2rem] group/bento transition-all duration-300 ink-border bg-white soft-shadow p-6 flex flex-col justify-between space-y-4 hover:-translate-y-1 hover:soft-shadow-lg",
    className
   )}
  >
   {header}
   <div className="transition-all duration-300">
    {icon}
    <div className="font-display text-falla-ink text-xl mb-2 mt-2 tracking-widest">
      {title}
    </div>

    <div className="font-sans font-medium text-falla-ink/60 text-sm leading-relaxed">
     {description}
    </div>
   </div>
  </div>
 );
};
