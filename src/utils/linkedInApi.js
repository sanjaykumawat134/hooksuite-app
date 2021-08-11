const axios = require("axios").default;
const {
  clientId,
  clientSecret,
  accessTokenUrl,
  authorizationUrl,
  redirectUri,
} = require("../../config/linkedInConfig");

// const getAuthorizationUrl = () => {
//   const state = Buffer.from(
//     Math.round(Math.random() * Date.now()).toString()
//   ).toString("hex");
//   const scope = encodeURIComponent(
//     "r_liteprofile r_emailaddress w_member_social"
//   );
//   const url = `${authorizationUrl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
//     redirectUri
//   )}&state=${state}&scope=${scope}`;
//   return url;
// };

const getAccessToken = (code) => {
  // const { code } = req.query;
  const body = {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  };
  return new Promise((resolve, reject) => {
    axios
      .post(accessTokenUrl, null, { params: body })
      .then((data) => {
        // console.log(data);
        resolve(data.data.access_token);
      })
      .catch((error) => {
        // console.log(error);
        reject(error);
      });
  });
};
const getLinkedinProfile = async (req) => {
  const token = req.access_token;
  if (!token) {
    console.log("no token was attached to request");
    return;
  }
  const params = {
    oauth2_access_token: token,
  };
  const user = await axios.get("https://api.linkedin.com/v2/me", { params });
  const userdata = user.data;
  const userEmaildata = await axios.get(
    "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
    { params }
  );
  const emailObj = userEmaildata.data.elements[0];
  const { emailAddress } = emailObj["handle~"];
  const userProfileData = await axios.get(
    "https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))",
    { params }
  );
  // console.log(userProfileData);
  const userImg =
    userProfileData.data.profilePicture["displayImage~"].elements[1]
      .identifiers[0].identifier;
  const userObj = {
    authProviderUserId: userdata.id,
    firstName: userdata.localizedFirstName,
    lastName: userdata.localizedLastName,
    email: emailAddress,
    displayImage: userImg,
    about: userdata.localizedHeadline,
  };
  return userObj;
};

// const getLinkedinEmail = async (req) => {
//   const token = req.access_token;
//   if (!token) {
//     console.log("no token was attached to request");
//     return;
//   }
//   const params = {
//     oauth2_access_token: token,
//   };

//   return emailAddress;
// };
// const getLinkedinUserImage = async () => {
//   const token = req.access_token;
//   if (!token) {
//     console.log("no token was attached to request");
//     return;
//   }
// };
//req or token (store token to session)
const publishContent = (req, linkedInId, content) => {};
module.exports = {
  // getAuthorizationUrl,
  getAccessToken,
  getLinkedinProfile,
};
