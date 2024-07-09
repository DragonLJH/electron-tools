Date.prototype.format = function (format) {
  return format.replace(/(YYYY)|(MM)|(DD)|(HH)|(mm)|(ss)/g, (match) => {
    switch (match[0]) {
      case "Y":
        return String(this.getFullYear()).slice(-match.length);
      case "M":
        return String(this.getMonth() + 1).padStart(match.length, "0");
      case "D":
        return String(this.getDate()).padStart(match.length, "0");
      case "H":
        return String(this.getHours()).padStart(match.length, "0");
      case "m":
        return String(this.getMinutes()).padStart(match.length, "0");
      case "s":
        return String(this.getSeconds()).padStart(match.length, "0");
      default:
        return match;
    }
  });
};
