
import xss from 'xss';

export const configureXssMiddleware = () => {
  // Define your custom options for xss middleware
  const xssOptions = {
    // Specify your custom options here
    whiteList: {
      a: ['href', 'title', 'target'],
      // Add more tags and attributes as needed
    },
  };

  // Return the configured xss middleware
  return (req, res, next) => {
    sanitizeRequest(req.body, xssOptions);
    sanitizeRequest(req.params, xssOptions);
    sanitizeRequest(req.query, xssOptions);

    next();
  };

  function sanitizeRequest(obj, options) {
    for (const key in obj) {
      if (typeof obj[key] === 'object') {
        sanitizeRequest(obj[key], options);
      } else if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key], options);
      }
    }
  }
};
