// const BASE_URL = "https://hov.actifyzone.com/ecom-test" ;
// const BASE_URL = "https://store-admin.actifyzone.com/STORE-API";
//  const BASE_URL = "http://192.168.108:8082";

const BASE_URL = '/store-uat'

// const BASE_URL = "https://store-admin-uat.actifyzone.com/store-uat";

// const BASE_URL = '/STORE-API'

// const BASE_URL = "/ECOM-ADMIN-PROD";
//  const BASE_URL = "/ecom-admin-uat" ;

// const BASE_URL = ''

// Master Admin
// "username":"master",

// "password":"123456"

// Group Admin
// "username":"group hov",
// "password":"admin"

const SAS_TOKEN =
  "sp=racwdli&st=2025-04-30T09:29:16Z&se=2026-04-30T17:29:16Z&spr=https&sv=2024-11-04&sr=c&sig=JvQdFfWzTJeb%2FtFpG6pxJG%2B5%2FlMLEbqdMR%2F6%2Fg%2BKNmU%3D";

const ACCOUNT_NAME = "actify";
const STORAGE_ACCOUNT_SAS = `https://${ACCOUNT_NAME}.blob.core.windows.net/?${SAS_TOKEN}`;
const CONTAINER_NAME = "cms";
const FOLDER_NAME = "ecom/ECOM-UAT";
// const FOLDER_NAME = "ecom/ECOM-PROD";

export {
  BASE_URL,
  SAS_TOKEN,
  ACCOUNT_NAME,
  STORAGE_ACCOUNT_SAS,
  CONTAINER_NAME,
  FOLDER_NAME,
};
