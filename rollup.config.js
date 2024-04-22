import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

const config = [
  // bundle
  {
    input: "./src/index.ts",
    output: {
      file: "./public/dist/paint.js",
      format: "es",
    },
    plugins: [typescript()],
  },

  // d.ts
  {
    input: "public/dist/dts/index.d.ts",
    output: {
      file: "./public/dist/paint.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
export default config;
