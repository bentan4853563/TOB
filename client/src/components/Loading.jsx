import MoonLoader from "react-spinners/MoonLoader";
import PropTypes from "prop-types";

const Loading = ({ loading }) => {
  return (
    loading && (
      <div className="flex left-0 top-0 w-full h-full bg-gray-200/95 justify-center items-center absolute z-50">
        <MoonLoader color="blue" />
      </div>
    )
  );
};

Loading.propTypes = {
  loading: PropTypes.bool.isRequired,
};

export default Loading;
