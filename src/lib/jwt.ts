export function parseJwtRole(token: string | null): "user" | "custodian" {
	try {
		if (!token) return "user";
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload.role === "custodian" ? "custodian" : "user";
	} catch {
		return "user";
	}
}
