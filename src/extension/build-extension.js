import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Files to copy from src to dist
const filesToCopy = [
  "src/extension/background.js",
  "src/extension/content.js",
  "src/extension/utils.js"
]

console.log("Copying extension files to dist...")

filesToCopy.forEach((file) => {
  const sourcePath = path.join(__dirname, file)
  const destPath = path.join(__dirname, "dist", path.basename(file))

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath)
    console.log(`✓ Copied ${file} to dist/`)
  } else {
    console.log(`✗ File not found: ${file}`)
  }
})

// Copy manifest.json
const manifestPath = path.join(__dirname, "manifest.json")
const manifestDestPath = path.join(__dirname, "dist", "manifest.json")

if (fs.existsSync(manifestPath)) {
  fs.copyFileSync(manifestPath, manifestDestPath)
  console.log("✓ Copied manifest.json to dist/")
} else {
  console.log("✗ manifest.json not found")
}

console.log("Extension build complete!")
