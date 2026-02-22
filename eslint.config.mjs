import nextConfig from "eslint-config-next";

export default [
  { ignores: ["node_modules/**", ".next/**", ".vite/**", "dist/**"] },
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
    },
  },
];
