const handleKeyDown = (event) => {
    if (event.key === " " && event.currentTarget.selectionStart === 0) {
    event.preventDefault();
  }
};

export default handleKeyDown


  