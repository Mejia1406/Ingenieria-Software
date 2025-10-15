import React, { useRef, useState, useEffect, ReactNode, MouseEventHandler, UIEvent } from 'react';
import { motion, useInView } from 'motion/react';

interface AnimatedItemProps {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.95, opacity: 0, y: 20 }}
      transition={{ duration: 0.25, delay }}
      className="mb-2 cursor-pointer will-change-transform"
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListProps<T = string> {
  items: T[];
  renderItem?: (item: T, index: number, selected: boolean) => ReactNode;
  onItemSelect?: (item: T, index: number) => void;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  noInternalScroll?: boolean; // if true, do not wrap in scroll container
}

const AnimatedList = <T,>({
  items,
  renderItem,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  itemClassName = '',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  noInternalScroll = false
}: AnimatedListProps<T>) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
            onItemSelect && onItemSelect(items[selectedIndex], selectedIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({ top: itemBottom - containerHeight + extraMargin, behavior: 'smooth' });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  const content = (
    <>
      {items.map((item, index) => (
        <AnimatedItem
          key={index}
          delay={0.04 * index}
          index={index}
          onMouseEnter={() => setSelectedIndex(index)}
          onClick={() => {
            setSelectedIndex(index);
            onItemSelect && onItemSelect(item, index);
          }}
        >
          <div className={`p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors ${selectedIndex === index ? 'ring-2 ring-blue-500' : ''} ${itemClassName}`}>
            {renderItem ? renderItem(item, index, selectedIndex === index) : (
              <p className="text-slate-800 m-0 text-sm font-medium">{String(item)}</p>
            )}
          </div>
        </AnimatedItem>
      ))}
    </>
  );

  if (noInternalScroll) {
    return (
      <div className={`relative w-full ${className}`}>
        {content}
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`}>
      <div
        ref={listRef}
        className={`max-h-[900px] overflow-y-auto pr-2 ${
          displayScrollbar
            ? '[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-[4px]'
            : 'scrollbar-hide'
        }`}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: displayScrollbar ? 'thin' : 'none',
          scrollbarColor: '#CBD5E1 #F1F5F9'
        }}
      >
        {content}
      </div>
      {showGradients && (
        <>
          <div
            className="pointer-events-none absolute top-0 left-0 right-2 h-[40px] bg-gradient-to-b from-white to-transparent transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-2 h-[60px] bg-gradient-to-t from-white to-transparent transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
};

export default AnimatedList;