// Get token from model, create cookie and send response
export const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    // A great mistake:
    // I accidentally wrote "expires" without an 's', different from Brad's "expires", and probably could never guess that this is the reason that the server refuse to work. 
    // (apparently, syntax has changed)
    expire: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    // we only want the cookie to be access through the client-side's script so -
    httpOnly: true,
  };

  // securing our cookie with edit the secure flag to true ("https") for production mode
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  // we send a token back in the response (key/name-of token + token itself)
  // we also sending a cookie
  // and it's up to the client-side how they want to handle it:
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};