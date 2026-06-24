export const msalConfig = {
    auth: {
        clientId:
            process.env.NEXT_PUBLIC_AZURE_CLIENT_ID ??
            process.env.NEXT_PUBLIC_CLIENT_ID ??
            "",
        authority: `https://login.microsoftonline.com/${
            process.env.NEXT_PUBLIC_AZURE_TENANT_ID ??
            process.env.NEXT_PUBLIC_TENANT_ID ??
            "common"
        }`,
        redirectUri:
            process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI ??
            process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI ??
            "http://localhost:3000",
    },
    cache: {
        cacheLocation: "sessionStorage",
    },
};

export const loginRequest = {
    scopes: ["User.Read"],
};