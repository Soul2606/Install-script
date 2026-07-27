import { join, relative } from "@std/path";
import { getDependencies, getGraph } from "./graph.ts";
import { up, fromProDir, config, sourceDir } from "./util.ts";
import * as Test from "./test.ts";
import { existsSync } from "jsr:@std/fs/exists";


const arg = Deno.args[0]
if (arg === "" || arg === undefined) Deno.exit()

if (arg === "list") {
	console.log(Object.keys(config.aliases).join(", "))
	Deno.exit()
}
if (arg === "src") {
	console.log(getGraph().map(n => relative(sourceDir, n.file)));
	Deno.exit()
}
if (arg === "test") {
	await Test.aliases(config)
	Deno.exit()
}

const file = (() => {
	const file = config.aliases[arg]

	if (file === undefined) return join(sourceDir, arg)

	return join(sourceDir, file)
})()

const info = await Deno.stat(file)
if (!info.isFile) {
	console.error("broken file path", file)
	Deno.exit(404)
}


const files = Array.from(getDependencies(file))
const rootDir = join(Deno.cwd(), "src", config.root_name)

const dry = Deno.args.includes("-dry")

const res = prompt(
`are you sure you want to copy the files in "${rootDir}" from:
${files.map(f => relative(sourceDir, f)).join(" ")}
y / n${dry ? ", dry run" : ""}`
)

if (res !== "y") Deno.exit()

console.log("Making root directory at:", rootDir);
if (!existsSync("./src")) {
	console.error("Directory ./src does not exist")
	Deno.exit()
}
if (!dry) try {
	Deno.mkdirSync(rootDir, {recursive:true})
} catch (_error) {
	console.error("Failed to create root directory, directory might already exist or you are missing the src subdirectory.")
}

for (const source of files) {
	const rel = relative(sourceDir, source);
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

