import Proptypes from "prop-types";
import "react-confirm-alert/src/react-confirm-alert.css";
import { confirmAlert } from "react-confirm-alert";
import { Tooltip } from "react-tooltip";

import { FaTrash } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { GoPlus } from "react-icons/go";
import { MdOutlineInsertComment } from "react-icons/md";
import DynamicHeightTextarea from "./DynamicHeightTextarea";

const EditableTable = ({
  tableName,
  tableData,
  handleEdit,
  handleReason,
  handleEditConfirm,
  handleReviewConfirm,
  newRow,
  handleDelete,
}) => {
  const columns = [
    "benefit",
    "limit",
    "edit",
    "New Benefit",
    "New Limit",
    "Edit Reason",
    "Review Required",
    "Reviewed",
    "Review Comment",
  ];

  const onClickDeleteIcon = (rowIndex) => {
    confirmAlert({
      title: "Delete!",
      message: "Are you sure to delete this row?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            handleDelete(tableName, rowIndex);
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  // Render the table
  return (
    <table className="w-full">
      <thead className="table-header">
        <tr className="">
          <th className="px-2">New</th>
          <th className="px-2">No</th>
          {columns.map((column, index) => {
            return (
              <th
                key={index}
                className="p-2 first-letter:capitalize border border-gray-300"
              >
                {column}
              </th>
            );
          })}
          <th>Del</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, rowIndex) => (
          <tr key={rowIndex} className="w-full">
            <td className="border border-gray-300">
              <GoPlus
                onClick={() => newRow(tableName, row.id)}
                className="cursor-pointer"
              />
            </td>
            <td>{rowIndex + 1}</td>
            {columns.map((column, columnIndex) => {
              if (columnIndex < 2) {
                if (row.color !== "yellow") {
                  return (
                    <td
                      key={columnIndex}
                      className={`${
                        row.color === "green"
                          ? "MATCH_FOUND"
                          : row.color === "red"
                          ? "NOT_OFFERED_BY_INSURER"
                          : "NOT_OFFERED_BY_QIC"
                      } ${
                        columnIndex === 0 ? "w-1/6" : "w-1/4"
                      } focus:outline-none border border-gray-300  min-h-[100px]`}
                    >
                      {/* {row[column]} */}
                      {/* Display the entire benefit text with its structure */}
                      <div>
                        {row &&
                          row[column] &&
                          row[column]
                            .split("\n")
                            .map((line, index) => (
                              <div key={index}>
                                {line.startsWith("□ ") ? (
                                  <span style={{ marginLeft: "20px" }}>
                                    {line.slice(3)}
                                  </span>
                                ) : (
                                  line
                                )}
                              </div>
                            ))}
                      </div>
                    </td>
                  );
                } else {
                  return (
                    <td
                      key={columnIndex}
                      className={`${
                        columnIndex === 0 ? "w-1/6" : "w-1/4"
                      } bg-white focus:outline-none border border-gray-300`}
                    >
                      <input
                        type="text"
                        value={row[column]}
                        onChange={(e) =>
                          handleEdit(tableName, e.target.value, row.id, column)
                        }
                        className="w-full bg-transparent focus:outline-none text-wrap"
                      />
                    </td>
                  );
                }
              }
              if (columnIndex === 2) {
                return (
                  <td key={columnIndex} className="border border-gray-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      onChange={() =>
                        handleEditConfirm(tableName, row.id, column)
                      }
                      checked={row.edit}
                    />
                  </td>
                );
              }
              if (columnIndex > 2 && columnIndex < 5) {
                return (
                  <td
                    key={columnIndex}
                    className={`${
                      columnIndex === 3 ? "w-1/6" : "w-1/4"
                    } border border-gray-300`}
                  >
                    {row["edit"] === true ? (
                      // <textarea
                      //   value={row[column]}
                      //   onChange={(e) =>
                      //     handleEdit(tableName, e.target.value, row.id, column)
                      //   }
                      //   className="w-full focus:outline-none h-full min-h-[100px] resize-none"
                      // />
                      <DynamicHeightTextarea
                        content={row[column]}
                        handleChange={(e) =>
                          handleEdit(tableName, e.target.value, row.id, column)
                        }
                      />
                    ) : (
                      row[column]
                    )}
                  </td>
                );
              }
              if (columnIndex === 5) {
                return (
                  <td
                    key={column}
                    className="w-[4rem] px-2 mx-auto border border-gray-300"
                  >
                    <div className="flex items-center gap-4">
                      <FaRegEdit
                        className="cursor-pointer"
                        onClick={() => handleReason(tableName, row.id, column)}
                      />
                      {row["Edit Reason"] !== "" && (
                        <>
                          <MdOutlineInsertComment
                            data-tip
                            onClick={() =>
                              handleReason(tableName, row.id, column)
                            }
                            data-tooltip-id={`comment-${rowIndex}-${columnIndex}`}
                            className="comment-icon focus:outline-none cursor-pointer"
                          />
                          <Tooltip
                            id={`comment-${rowIndex}-${columnIndex}`}
                            place="bottom"
                            effect="solid"
                            content={row["Edit Reason"]}
                            style={{
                              width: "240px",
                              textAlign: "left",
                              fontSize: "14px",
                              backgroundColor: "#595959",
                              color: "white",
                              borderRadius: "4px",
                              padding: "8px",
                            }}
                          />
                        </>
                      )}
                    </div>
                  </td>
                );
              }
              if (columnIndex === 6) {
                return (
                  <td key={columnIndex} className="border border-gray-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      readOnly
                      checked={row["Review Required"]}
                    />
                  </td>
                );
              }
              if (columnIndex === 7) {
                return (
                  <td key={columnIndex} className="px-2 border border-gray-300">
                    {row["Review Required"] && (
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        onChange={() =>
                          handleReviewConfirm(tableName, row.id, column)
                        }
                        checked={row.Reviewed}
                      />
                    )}
                  </td>
                );
              }
              if (columnIndex === 8) {
                return (
                  <td
                    key={`comment-cell-${rowIndex}`}
                    className="px-2 border border-gray-300"
                  >
                    <div className="flex items-center gap-4">
                      <FaRegEdit
                        className="cursor-pointer"
                        onClick={() => handleReason(tableName, row.id, column)}
                      />
                      {row["Review Comment"] !== "" && (
                        <>
                          <MdOutlineInsertComment
                            data-tip
                            onClick={() =>
                              handleReason(tableName, row.id, column)
                            }
                            data-tooltip-id={`ReviewComment-${rowIndex}`} // changed to `data-for` to match Tooltip's expected prop
                            className="comment-icon focus:outline-none cursor-pointer"
                          />
                          <Tooltip
                            id={`ReviewComment-${rowIndex}`}
                            place="bottom"
                            effect="solid"
                            className="tooltip-custom" // use a className for styling instead of inline styles
                          >
                            {row["Review Comment"]}
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </td>
                );
              }
            })}
            <td key={`delete-${rowIndex}`} className="border border-gray-300">
              <FaTrash
                onClick={() => onClickDeleteIcon(row.id)}
                className="h-4 w-4 cursor-pointer delete-icon"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

EditableTable.propTypes = {
  tableName: Proptypes.string.isRequired,
  tableData: Proptypes.array.isRequired,
  handleEdit: Proptypes.func.isRequired,
  handleReason: Proptypes.func.isRequired,
  handleEditConfirm: Proptypes.func.isRequired,
  handleReviewConfirm: Proptypes.func.isRequired,
  newRow: Proptypes.func.isRequired,
  handleDelete: Proptypes.func.isRequired,
};

export default EditableTable;
