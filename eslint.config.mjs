import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Purement cosmétique (apostrophes/guillemets dans le JSX) : ne doit pas
      // bloquer le build de production.
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
