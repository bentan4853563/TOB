import PropTypes from "prop-types";
import Select from "react-select";

const Pagination = ({
  itemsCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  currentPage,
}) => {
  // Calculate the total pages
  const pagesCount = Math.ceil(itemsCount / pageSize);
  const pages = Array.from({ length: pagesCount }, (_, i) => i + 1);

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
  ];

  const selectedPageSizeOption = pageSizeOptions.find(
    (option) => option.value === pageSize
  );

  // Handler to deal with page size change for react-select
  const handlePageSizeChange = (selectedOption) => {
    onPageSizeChange(selectedOption.value);
  };

  return (
    <div className="w-full flex justify-between items-center mb-8">
      {/* Page size selection */}
      <Select
        menuPlacement="top"
        value={selectedPageSizeOption}
        onChange={handlePageSizeChange}
        options={pageSizeOptions}
        className="w-20" // You might need to adjust the styling as needed
        components={{
          IndicatorSeparator: () => null,
        }}
      />

      {/* Pagination Nav */}
      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 mx-1 bg-white border border-gray-300 rounded-md ${
            currentPage === 1 ? "cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          Prev
        </button>

        {/* Page Numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={currentPage === page}
            className={`px-4 py-2 mx-1 text-sm border ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            } rounded-md`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === pagesCount}
          className={`px-4 py-2 mx-1 bg-white border border-gray-300 rounded-md ${
            currentPage === pagesCount
              ? "cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

Pagination.propTypes = {
  itemsCount: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  currentPage: PropTypes.number,
};

export default Pagination;
