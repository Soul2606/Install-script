import { fromFileUrl, join, basename, relative } from "@std/path";
import { getDependencies } from "./graph.ts";
import { pdir, up } from "./util.ts";

type ConfigSch = {
	"source_dir":string
	"aliases":Record<string,string>
	"dir_name":string
}

const config:ConfigSch = JSON.parse(Deno.readTextFileSync(fromFileUrl(new URL("./config.json", pdir))))

const arg = Deno.args[0]
if (arg === "" || arg === undefined) Deno.exit()

const file = (() => {
	const file = config.aliases[arg]

	if (file === undefined) Deno.exit()

	return join(config.source_dir, file)
})()

const files = Array.from(getDependencies(file))
const libDir = join(Deno.cwd(), config.dir_name)
const res = prompt(`are you sure you want to copy the files in "${libDir}":\n${files.join(" ")}\n y / n\n`)

let dry = false
if (res === "dry") {
	dry = true
} else if (res !== "y") Deno.exit()

console.log("Making root directory at:", libDir);
if (!dry) Deno.mkdirSync(libDir)

for (const source of files) {
	const rel = relative(config.source_dir, source);
	const dest = join(libDir, rel);
	const dir = up(dest)

	const relSrc = fromFileUrl(new URL(source, pdir))

	console.log("setting up directories at:", dir, "copying file at:", dest, "from source:", relSrc);
	
	if (dry) continue
	Deno.mkdirSync(dir, {recursive:true})
	Deno.copyFileSync(
		relSrc,
		dest
	)
}
