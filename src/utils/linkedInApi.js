const axios = require("axios").default;
const fs = require("fs");
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
//req or token (store token to session)
//req will have access token , and content to publish on linkedin
const publishContent = async (access_token, linkedinId, imagePath, text) => {
  const data = {
    registerUploadRequest: {
      recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
      owner: `urn:li:person:${linkedinId}`,
      serviceRelationships: [
        {
          relationshipType: "OWNER",
          identifier: "urn:li:userGeneratedContent",
        },
      ],
    },
  };
  const assetsData = await axios.post(
    "https://api.linkedin.com/v2/assets?action=registerUpload",
    data,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const uploadUrl =
    assetsData.data.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ].uploadUrl;
  const asset = assetsData.data.value.asset;

  const file = fs.readFileSync(imagePath);
  const blob = Buffer.from(file);

  await axios.post(uploadUrl, blob, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/octet-stream",
    },
  });

  const uploadResponse = await axios.post(
    "https://api.linkedin.com/v2/ugcPosts",
    {
      author: `urn:li:person:${linkedinId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text,
          },
          shareMediaCategory: "IMAGE",
          media: [
            {
              status: "READY",
              description: {
                text: "Center stage!",
              },
              media: asset,
              title: {
                text: "LinkedIn Talent Connect 2021",
              },
            },
          ],
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  return uploadResponse;
};

const simpleTextShare = async (text, access_token, linkedInId) => {
  const shareResponse = await axios.post(
    "https://api.linkedin.com/v2/ugcPosts",
    {
      author: `urn:li:person:${linkedInId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    },
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
      },
    }
  );
  return shareResponse;
};
module.exports = {
  getAccessToken,
  getLinkedinProfile,
  publishContent,
  simpleTextShare,
};
