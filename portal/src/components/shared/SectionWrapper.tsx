import { ReactNode } from 'react';
import { motion } from 'framer-motion';
interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
  pattern?: boolean;
}
const SectionWrapper = ({ children, className = '', id, pattern = false }: SectionWrapperProps) => {
  return (
    <section id={id} className={`py-10 md:py-16 px-4 ${pattern ? 'islamic-pattern' : ''} ${className}`}>
      <div className="container mx-auto max-w-7xl">
        {children}
      </div>
    </section>
  );
};
export default SectionWrapper;
export { SectionWrapper };
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
}
export const SectionHeader = ({ title, subtitle, badge, centered = true }: SectionHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className={`mb-8 md:mb-10 ${centered ? 'text-center' : 'text-left'}`}
    >
      {badge && (
        <span className="inline-block mb-3 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-full bg-primary/10 text-primary border border-primary/20">
          {badge}
        </span>
      )}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">{title}</h2>
      {subtitle && (
        <p className={`mt-4 text-muted-foreground text-base md:text-lg leading-relaxed ${centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>{subtitle}</p>
      )}
    </motion.div>
  );
};