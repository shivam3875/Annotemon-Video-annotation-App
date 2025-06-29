
const Tooltip = ({ children, text }) => (
  <span className="relative group cursor-pointer">
    {children}
    <span className="
      absolute left-1/2 -translate-x-1/2 bottom-full mb-2
      opacity-0 group-hover:opacity-100
      bg-white text-blue-300 text-xs rounded px-2 py-1
      transition-opacity duration-200 whitespace-nowrap
      pointer-events-none z-10
    ">
      {text}
    </span>
  </span>
);

export default Tooltip;
