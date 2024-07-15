import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { getUserByID, createUser } from "@/app/neo4j.action";

export default async function CallbackPage() {
	const { isAuthenticated, getUser } = getKindeServerSession();
	if (!(await isAuthenticated())) {
		return redirect(
			"/api/auth/login?post_login_redirect_url=http://localhost:3000/callback",
		);
	}

	const user = await getUser();

	if (!user) {
		return redirect(
			"/api/auth/login?post_login_redirect_url=http://localhost:3000/callback",
		);
	}

	// Check if user already there in eo4j
	const dbUser = await getUserByID(user.id);

	if (!dbUser) {
		// Create user in neo4j
		await createUser({
			applicationId: user.id,
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			firstName: user.given_name!,
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			lastName: user.family_name!,
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			email: user.email!,
		});
	}

	return redirect("/");
}
