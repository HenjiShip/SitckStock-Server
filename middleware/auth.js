import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    let token = null;
    if (req?.headers?.authorization) {
      token = req?.headers?.authorization.split(" ")[1];
    }
    const isCustomAuth = token.length < 500;

    let decodedData;

    if (token && isCustomAuth) {
    } else {
      decodedData = jwt.decode(token);
      req.userId = decodedData?.sub;
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

export default auth;
