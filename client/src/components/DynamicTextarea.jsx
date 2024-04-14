import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const DynamicTextarea = ({ value, onChange }) => {
  const [textareaHeight, setTextareaHeight] = useState("auto");

  const handleTextareaChange = (event) => {
    setTextareaHeight("auto"); // Reset height to auto
    setTextareaHeight(`${event.target.scrollHeight}px`); // Set height based on scroll height

    // Call the parent component's onChange handler
    onChange(event);
  };

  // Update the height when the value changes
  useEffect(() => {
    setTextareaHeight("auto"); // Reset height to auto
    setTextareaHeight(`${event.target.scrollHeight}px`); // Set height based on scroll height
  }, [value]);

  return (
    <textarea
      value={value}
      onChange={handleTextareaChange}
      style={{ height: textareaHeight }}
      className="w-full h-full resize-none focus:outline-none scroll-hidden"
    ></textarea>
  );
};

DynamicTextarea.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

export default DynamicTextarea;
