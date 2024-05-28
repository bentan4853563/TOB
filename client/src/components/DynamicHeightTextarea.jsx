import PropTypes from "prop-types";

import { useEffect, useRef } from "react";

const DynamicHeightTextarea = ({ content, handleChange }) => {
  const textareaRef = useRef(null);

  // Function to adjust textarea height
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      // Set the height to scroll height to remove scrollbar and then reset back to default
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Adjust the height whenever the content changes
  useEffect(adjustHeight, [content]);

  return (
    <textarea
      ref={textareaRef}
      className="w-full focus:outline-none resize-none overflow-hidden"
      value={content}
      onChange={handleChange}
    />
  );
};

DynamicHeightTextarea.propTypes = {
  content: PropTypes.string,
  handleChange: PropTypes.func,
};

export default DynamicHeightTextarea;
