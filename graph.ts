import { canonicalImport, readDirRecurse, resolve, up, fromProDir } from "./util.ts";

type Node = {
	file: string
	dependencies: string[]
}

const graph:Node[] = []

const regex = /^import\s+(?:.+?\s+from\s+)?["']([^"']+)["']/gm

for(const path of readDirRecurse(fromProDir("./library/src")).map(canonicalImport)) {
	const text = Deno.readTextFileSync(path)
	const node:Node = {
		file:path,
		dependencies:[]
	}
	for (const matches of text.matchAll(regex)) {
		const importPath = matches[1]
		if (importPath === undefined) continue
		node.dependencies.push(resolve(up(path), canonicalImport(importPath)))
	}
	graph.push(node)
}


/**
 * @returns all dependencies including itself.
 */
export function getDependencies(path:string, checked = new Set<Node>()):Set<string> {
	const node = graph.find(n => n.file === path)
	if (!node) throw new Error(`Missing graph node for file: "${path}"`)
	if (checked.has(node)) return new Set()
	checked.add(node)

	const dependencies = new Set<string>([node.file])

	node.dependencies.forEach(dep => 
		getDependencies(dep, checked).forEach(file => dependencies.add(file))
	)

	return dependencies
}



export function getGraph() {
	return structuredClone(graph)
}