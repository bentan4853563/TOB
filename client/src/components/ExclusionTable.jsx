import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { getContent } from "../redux/actions/content";

import { GoPlus } from "react-icons/go";
import { FaTrash } from "react-icons/fa";

function ExclusionTable({
  regulator,
  editable,
  dha,
  haad,
  handleNewExclusion,
  handleEditExclusion,
  handleDeleteExclusion,
}) {
  const dispatch = useDispatch();

  const [endPoint, setEndPoint] = useState("");

  useEffect(() => {
    dispatch(getContent());
    setEndPoint(getEndPoint());
  }, []);

  const getEndPoint = () => {
    const currentHref = window.location.href;
    const parsedUrl = new URL(currentHref);
    const pathSegments = parsedUrl.pathname
      .split("/")
      .filter((segment) => segment);
    return pathSegments[pathSegments.length - 1];
  };

  return (
    <div className="w-full">
      <h1 className="text-3xl text-black font-bold m-4">Exclusions</h1>
      <div className="h-[24rem] overflow-y-auto">
        <table className="w-full ">
          <thead className="table-header">
            <tr>
              {endPoint !== "view" && editable && (
                <th className="py-2 border border-gray-300">New</th>
              )}
              <th className="py-2 border border-gray-300">No</th>
              <th className="py-2 border border-gray-300">Description</th>
              {endPoint !== "view" && editable && (
                <th className="py-2 border border-gray-300">Del</th>
              )}
            </tr>
          </thead>
          <tbody>
            {regulator === "DHA"
              ? dha &&
                dha.length > 0 &&
                dha.map((row, index) => (
                  <tr key={index}>
                    {endPoint !== "view" && editable && (
                      <td className="border border-gray-300">
                        <GoPlus
                          className="cursor-pointer"
                          onClick={() => handleNewExclusion(index)}
                        />
                      </td>
                    )}
                    <td className="border border-gray-300">{index + 1}</td>
                    <td className="w-full border border-gray-300">
                      {endPoint !== "view" && editable ? (
                        <textarea
                          value={row}
                          onChange={(e) =>
                            handleEditExclusion(index, e.target.value)
                          }
                          className="w-full focus:outline-none bg-transparent"
                        />
                      ) : (
                        row
                      )}
                    </td>
                    {endPoint !== "view" && editable && (
                      <td
                        key={`delete-${index}`}
                        className="border border-gray-300"
                      >
                        <FaTrash
                          onClick={() => handleDeleteExclusion(index)}
                          className="h-4 w-4 cursor-pointer delete-icon"
                        />
                      </td>
                    )}
                  </tr>
                ))
              : regulator === "HAAD" &&
                haad &&
                haad.length > 0 &&
                haad.map((row, index) => (
                  <tr key={index}>
                    {endPoint !== "view" && editable && (
                      <td className="border border-gray-300">
                        <GoPlus className="cursor-pointer" />
                      </td>
                    )}
                    <td className="border border-gray-300">{index + 1}</td>
                    <td className="w-full border border-gray-300">
                      {endPoint !== "view" && editable ? (
                        <textarea
                          value={row}
                          onChange={(e) =>
                            handleEditExclusion(index, e.target.value)
                          }
                          className="w-full focus:outline-none bg-transparent"
                        />
                      ) : (
                        row
                      )}
                    </td>
                    {endPoint !== "view" && editable && (
                      <td
                        key={`delete-${index}`}
                        className="border border-gray-300"
                      >
                        <FaTrash
                          onClick={() => handleDeleteExclusion(index)}
                          className="h-4 w-4 cursor-pointer delete-icon"
                        />
                      </td>
                    )}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ExclusionTable.propTypes = {
  regulator: PropTypes.string.isRequired,
  editable: PropTypes.bool,
  dha: PropTypes.array,
  haad: PropTypes.array,
  handleNewExclusion: PropTypes.func,
  handleEditExclusion: PropTypes.func,
  handleDeleteExclusion: PropTypes.func,
};

export default ExclusionTable;
