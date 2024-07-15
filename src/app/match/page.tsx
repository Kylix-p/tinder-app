import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { getMatches } from "../neo4j.action";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
} from "../../components/ui/card";
import React from "react";

export default async function MatchPage() {
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
	const matches = await getMatches(user.id);

	return (
		<main>
			{matches.map((user) => (
				<Card key={user.applicationId}>
					<CardHeader>
						<CardTitle>
							{user.firstName} {user.lastName}
						</CardTitle>
						<CardDescription>{user.email}</CardDescription>
					</CardHeader>
				</Card>
			))}
		</main>
	);
}
