import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { GoPlus } from "react-icons/go";
import { FaTrash } from "react-icons/fa";
import { getContent } from "../redux/actions/content";

function AdditionalContent({ regulator }) {
  const dispatch = useDispatch();
  const { contents } = useSelector((state) => state.content);
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

  console.log(endPoint);

  return (
    <div className="w-full">
      <h1 className="text-3xl text-black font-bold m-4">Additional Contents</h1>
      <div className="h-[24rem] overflow-y-auto">
        <table className="w-full ">
          <thead className="table-header">
            <tr>
              {endPoint !== "view" && (
                <th className="py-2 border border-gray-300">New</th>
              )}
              <th className="py-2 border border-gray-300">No</th>
              <th className="py-2 border border-gray-300">Description</th>
              {endPoint !== "view" && (
                <th className="py-2 border border-gray-300">Del</th>
              )}
            </tr>
          </thead>
          <tbody>
            {regulator === "DHA" && contents
              ? contents[0].description.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300">
                      <GoPlus className="cursor-pointer" />
                    </td>
                    <td className="border border-gray-300">{index + 1}</td>
                    <td className="w-full border border-gray-300">
                      {endPoint === "view" ? row : <textarea value={row} />}
                    </td>
                    <td
                      key={`delete-${index}`}
                      className="border border-gray-300"
                    >
                      <FaTrash
                        // onClick={() => onClickDeleteIcon(row.id)}
                        className="h-4 w-4 cursor-pointer delete-icon"
                      />
                    </td>
                  </tr>
                ))
              : regulator === "HAAD" &&
                contents &&
                contents[1].description.map((row, index) => (
                  <tr key={index}>
                    {endPoint !== "view" && (
                      <td className="border border-gray-300">
                        <GoPlus className="cursor-pointer" />
                      </td>
                    )}
                    <td className="border border-gray-300">{index + 1}</td>
                    <td className="w-full border border-gray-300">
                      {endPoint === "view" ? row : <textarea value={row} />}
                    </td>
                    {endPoint !== "view" && (
                      <td
                        key={`delete-${index}`}
                        className="border border-gray-300"
                      >
                        <FaTrash
                          // onClick={() => onClickDeleteIcon(row.id)}
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

AdditionalContent.propTypes = {
  regulator: PropTypes.string.isRequired,
};

export default AdditionalContent;
