// src/utils/airlineLogos.js
const logoFiles = import.meta.glob("../assets/logos/*.webp", { eager: true, import: "default" });

const airlineLogos = {};
for (const path in logoFiles) {
  const fileName = path.split("/").pop().replace(/\.webp$/, "");
  airlineLogos[fileName] = logoFiles[path];
}

export default airlineLogos;
