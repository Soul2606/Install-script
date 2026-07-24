import { join } from "@std/path";
import { ConfigSch, sourceDir } from "./util.ts";

export async function aliases(config:ConfigSch) {
	console.log("testing:");
	for (const path of Object.values(config.aliases)) {
		const file = join(sourceDir, path)
		console.log(file);
		try {
			const info = await Deno.stat(file)
			if (!info.isFile) {
				console.error("failed")
			} else {
				console.log("passed");
			}
		} catch (_error) {
			console.log("failed");
			
		}
	}
}