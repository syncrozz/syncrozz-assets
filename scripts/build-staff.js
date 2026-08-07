const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");
const sharp = require("sharp");

const ROOT = process.cwd();
const INPUT_DIR = path.join(ROOT, "_raw", "staff");
const OUTPUT_DIR = path.join(ROOT, "profile", "staff");

async function main() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Input folder not found: ${INPUT_DIR}`);
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = await fg(["*.jpg", "*.jpeg", "*.png", "*.webp"], {
    cwd: INPUT_DIR,
    onlyFiles: true,
  });

  if (files.length === 0) {
    console.log("No staff images found in _raw/staff");
    return;
  }

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const baseName = path.parse(file).name;
    const outputPath = path.join(OUTPUT_DIR, `${baseName}.webp`);

    try {
      await sharp(inputPath)
        .resize(400, 400, { fit: "cover", position: "centre" })
        .webp({ quality: 85 })
        .toFile(outputPath);

      console.log(`OK  ${file} -> ${baseName}.webp`);
      success++;
    } catch (error) {
      console.error(`FAIL ${file}`);
      console.error(error.message);
      failed++;
    }
  }

  console.log("");
  console.log("Build complete");
  console.log(`Success: ${success}`);
  console.log(`Failed : ${failed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});