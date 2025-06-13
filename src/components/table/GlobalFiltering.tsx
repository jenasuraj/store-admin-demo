const GlobalFiltering = ({ filter, setFilter }) => {
  return (
    <input
      className="flex rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-8 w-[150px] lg:w-[250px] dark:bg-gray-900 dark:text-gray-200"
      // className=""
      placeholder="Search Here..."
      type="text"
      value={filter || ""}
      onChange={(e) => setFilter(e.target.value)}
    />
  );
};

export default GlobalFiltering;
