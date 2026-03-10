const crypto = require("crypto");
const fs = require("fs");

const args = process.argv.slice(2);

const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return null;
  return args[index + 1] ?? null;
};

const hasFlag = (name) => args.includes(`--${name}`);

const readStdin = () => {
  try {
    return fs.readFileSync(0, "utf8").trim();
  } catch {
    return "";
  }
};

const algo = (getArg("algo") ?? "pbkdf2").toLowerCase();
const password = getArg("password") ?? (hasFlag("stdin") ? readStdin() : "");
const iterationsInput = Number(getArg("iterations"));
const iterations = Number.isFinite(iterationsInput) && iterationsInput > 0
  ? Math.floor(iterationsInput)
  : 120000;

if (!password) {
  console.error(
    "Missing password. Use --password \"...\" or pipe input with --stdin."
  );
  process.exit(1);
}

if (algo !== "pbkdf2" && algo !== "sha256") {
  console.error("Unsupported algo. Use --algo pbkdf2 or --algo sha256.");
  process.exit(1);
}

if (algo === "sha256") {
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  console.log(`passwordHash: \"${hash}\"`);
  process.exit(0);
}

const salt = getArg("salt") ?? crypto.randomBytes(16).toString("hex");
const hash = crypto
  .pbkdf2Sync(password, salt, iterations, 32, "sha256")
  .toString("hex");

console.log(`passwordHash: \"${hash}\"`);
console.log(`passwordSalt: \"${salt}\"`);
console.log(`passwordIterations: ${iterations}`);
