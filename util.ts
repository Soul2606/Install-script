import { fromFileUrl } from "@std/path";

export const pdir = new URL(".", import.meta.url); //"~/Coding/typescript/RnD & prototypes/Install-script"

export function readDirRecurse(path:string) {
	const files:string[] = []
	recurse(path)
	function recurse(path:string) {
		for (const entry of Deno.readDirSync(path)) {
			if (entry.isFile) files.push(path + "/" + entry.name);
			if (entry.isDirectory) recurse(path + "/" + entry.name)
		}
	}
	return files
}

export function resolve(path:string, relative:string) {
	if (relative.startsWith(".") && !relative.startsWith("..")) relative = relative.slice(2)
	const commands = relative.split("/")
	const command = commands.at(0)
	if (command === undefined || command === "") return path
	const parsed = path.split("/")
	commands.splice(0,1)

	if (command === "..") return resolve(
		parsed.slice(0,-1).join("/"),
		commands.join("/")
	)

	if (command.startsWith(".")) throw new Error(`invalid relative path: "${relative}"`);
	
	parsed.push(command)
	return resolve(
		parsed.join("/"),
		commands.join("/")
	)
}

export function up(path:string, times = 1) {
	return path.split("/").slice(0,-Math.abs(Math.floor(times))).join("/")
}

export function canonicalImport(path:string) {
	if (path.endsWith(".js")) return path.slice(0, -3) + ".ts"
	if (path.endsWith(".ts")) return path
	return path + ".ts"
}

export function fromProDir(path:string) {
	return fromFileUrl(new URL(path, pdir))
}

export type ConfigSch = {
	"aliases":Record<string,string>
	"root_name":string
}

export const config:ConfigSch = JSON.parse(Deno.readTextFileSync(fromProDir("./config.json")))

export const sourceDir = fromProDir("./library/src")
