import { join, relative } from "@std/path";
import { getDependencies } from "./graph.ts";
import { up, fromProDir } from "./util.ts";

type ConfigSch = {
	"source_dir":string
	"aliases":Record<string,string>
	"root_name":string
}

const config:ConfigSch = JSON.parse(Deno.readTextFileSync(fromProDir("./config.json")))

const arg = Deno.args[0]
if (arg === "" || arg === undefined) Deno.exit()

const file = (() => {
	const file = config.aliases[arg]

	if (file === undefined) Deno.exit()

	return join(config.source_dir, file)
})()

const files = Array.from(getDependencies(file))
const rootDir = join(Deno.cwd(), "src", config.root_name)

const dry = Deno.args.includes("-dry")

const res = prompt(
`are you sure you want to copy the files in "${rootDir}" from:
${files.map(f => relative(config.source_dir, f)).join(" ")}
y / n${dry ? ", dry run" : ""}`
)

if (res !== "y") Deno.exit()

console.log("Making root directory at:", rootDir);
if (!dry) try {
	Deno.mkdirSync(rootDir)
} catch (_error) {
	console.error("Failed to create root directory, directory might already exist or you are missing the src subdirectory.")
	Deno.exit()
}

for (const source of files) {
	const rel = relative(config.source_dir, source);
	const dest = join(rootDir, rel);
	const dir = up(dest)

	const relSrc = fromProDir(source)

	console.log("setting up directories at:", dir, "copying file at:", dest, "from source:", relSrc);
	
	if (dry) continue
	Deno.mkdirSync(dir, {recursive:true})
	Deno.copyFileSync(
		relSrc,
		dest
	)
}

console.log(files.length, "packages installed");

