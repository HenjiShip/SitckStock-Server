import userInfo from "../models/userInfo.js";

export const createUser = async (req, res) => {
  const info = req.body;

  try {
    const filter = { userId: info.sub };
    const update = {
      name: info.name,
      userId: info.sub,
      userImage: info.picture,
    };
    const options = { upsert: true, new: true };
    const result = await userInfo.findOneAndUpdate(filter, update, options);
    result.save()
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error creating user");
  }
};

export const fetchUser = async (req, res) => {
  const { creator } = req.params;
  try {
    const currentUser = await userInfo.findOne({ _id: creator });
    res.status(200).json(currentUser);
  } catch (error) {
    console.log({ message: "no user" });
  }
};

export const fetchUserId = async (req, res) => {
  const { _id } = await userInfo.findOne({ userId: req.userId });
  res.json(_id);
};

// export const createUser = async (req, res) => {
//   const info = req.body;

//   const user = {
//     name: info.name,
//     userId: info.sub,
//     userImage: info.picture,
//   };

//   try {
//     const filter = { userId: info.sub };
//     const options = { upsert: true, new: true };
//     const result = await userInfo.findOneAndUpdate(filter, user, options);
//     res.json(result);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Error creating user");
//   }
// };

// export const createUser = async (req, res) => {
//   const info = req.body;

//   const existingUser = await userInfo.findOne({
//     userId: info.sub,
//   });
//   const newUser = new userInfo({
//     name: info.name,
//     userId: info.sub,
//     userImage: info.picture,
//   });

//   try {
//     if (!existingUser) {
//       newUser.save();
//     }
//     res.json(newUser);
//   } catch (error) {
//     console.log(error);
//   }
// };
