import Proptypes from "prop-types";

const ViewTable = ({ tableData }) => {
  function findLargestObjectColumns(tableData) {
    if (tableData.length === 0) {
      return [];
    }
    let largestObject = tableData.reduce((maxObj, currentObj) => {
      return Object.keys(currentObj).length > Object.keys(maxObj).length
        ? currentObj
        : maxObj;
    });
    return Object.keys(largestObject);
  }

  const columns = findLargestObjectColumns(tableData);

  // Render the table
  return (
    <table className="w-full">
      <thead>
        <tr>
          {columns.map((column, index) => {
            if (column === "status") {
              return null;
            }
            return (
              <th key={index} className="p-4 first-letter:capitalize">
                {column}
              </th>
            );
          })}
          <th>Check</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column, columnIndex) => {
              if (column === "status") {
                return null;
              }
              return (
                <td key={columnIndex}>
                  <input
                    type="text"
                    value={row[column]}
                    readOnly
                    className={`${
                      row.status === "checked" ? "bg-green-100" : "bg-red-100"
                    } w-full focus:outline-none p-2 rounded-md`}
                  />
                </td>
              );
            })}
            <td>
              <input
                type="checkbox"
                className="w-5 h-5"
                readOnly
                checked={row.status === "checked"}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

ViewTable.propTypes = {
  tableData: Proptypes.array.isRequired,
};

export default ViewTable;
